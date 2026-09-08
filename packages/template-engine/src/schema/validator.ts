import {
  TEMPLATE_SCHEMA_VERSION,
  type FieldOptions,
  type FieldType,
  type SchemaValidationError,
  type SchemaValidationResult,
  type TemplateSchema
} from "./types.js";

import { fieldTypeRegistry } from "./registry.js";

const FIELD_KEY_PATTERN =
  /^[a-z][a-zA-Z0-9_]*$/;

const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const TEMPLATE_ID_PATTERN =
  /^[A-Za-z0-9_-]+$/;

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value);

export interface TemplateValidationContext {
  schemas?: Map<string, TemplateSchema>;
}

export class TemplateSchemaValidator {
  validate(
    schema: unknown,
    context: TemplateValidationContext = {}
  ): SchemaValidationResult {
    const errors: SchemaValidationError[] = [];

    if (!isRecord(schema)) {
      return {
        valid: false,
        errors: [
          {
            path: "$",
            code: "INVALID_SCHEMA",
            message:
              "Template schema must be an object"
          }
        ]
      };
    }

    this.validateSchemaVersion(
      schema,
      errors
    );

    this.validateTemplateId(
      schema,
      errors
    );

    this.validateMetadata(
      schema,
      errors
    );

    this.validateVersion(
      schema,
      errors
    );

    this.validateStatus(
      schema,
      errors
    );

    const fields = this.validateFields(
      schema,
      errors
    );

    this.validateSections(
      schema,
      fields,
      errors
    );

    this.validateRelations(
      schema,
      fields,
      context,
      errors
    );

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private validateSchemaVersion(
    schema: Record<string, unknown>,
    errors: SchemaValidationError[]
  ): void {
    if (
      schema.schemaVersion !==
      TEMPLATE_SCHEMA_VERSION
    ) {
      errors.push({
        path: "$.schemaVersion",
        code: "INVALID_SCHEMA",
        message:
          `schemaVersion must equal ${TEMPLATE_SCHEMA_VERSION}`
      });
    }
  }

  private validateTemplateId(
    schema: Record<string, unknown>,
    errors: SchemaValidationError[]
  ): void {
    if (
      typeof schema.id !== "string" ||
      schema.id.trim() === ""
    ) {
      errors.push({
        path: "$.id",
        code: "INVALID_TEMPLATE_ID",
        message:
          "Template id must be a non-empty string"
      });

      return;
    }

    if (!TEMPLATE_ID_PATTERN.test(schema.id)) {
      errors.push({
        path: "$.id",
        code: "INVALID_TEMPLATE_ID",
        message:
          "Template id contains invalid characters"
      });
    }
  }

  private validateMetadata(
    schema: Record<string, unknown>,
    errors: SchemaValidationError[]
  ): void {
    const metadata =
      schema.metadata;

    if (!isRecord(metadata)) {
      errors.push({
        path: "$.metadata",
        code: "INVALID_METADATA",
        message:
          "metadata must be an object"
      });

      return;
    }

    if (
      typeof metadata.name !== "string" ||
      metadata.name.trim() === ""
    ) {
      errors.push({
        path: "$.metadata.name",
        code: "INVALID_METADATA",
        message:
          "metadata.name must be non-empty"
      });
    }

    if (
      typeof metadata.slug !== "string" ||
      metadata.slug.trim() === ""
    ) {
      errors.push({
        path: "$.metadata.slug",
        code: "INVALID_SLUG",
        message:
          "metadata.slug must be non-empty"
      });
    } else if (
      !SLUG_PATTERN.test(metadata.slug)
    ) {
      errors.push({
        path: "$.metadata.slug",
        code: "INVALID_SLUG",
        message:
          "metadata.slug must contain lowercase letters, numbers and hyphens only"
      });
    }

    for (const key of [
      "description",
      "icon",
      "category"
    ]) {
      if (
        metadata[key] !== undefined &&
        typeof metadata[key] !== "string"
      ) {
        errors.push({
          path: `$.metadata.${key}`,
          code: "INVALID_METADATA",
          message:
            `metadata.${key} must be a string`
        });
      }
    }
  }

  private validateVersion(
    schema: Record<string, unknown>,
    errors: SchemaValidationError[]
  ): void {
    if (
      typeof schema.version !== "number" ||
      !Number.isInteger(schema.version) ||
      schema.version < 1
    ) {
      errors.push({
        path: "$.version",
        code: "INVALID_TEMPLATE_VERSION",
        message:
          "version must be a positive integer"
      });
    }
  }

  private validateStatus(
    schema: Record<string, unknown>,
    errors: SchemaValidationError[]
  ): void {
    const allowed = new Set([
      "DRAFT",
      "PUBLISHED",
      "ARCHIVED"
    ]);

    if (
      typeof schema.status !== "string" ||
      !allowed.has(schema.status)
    ) {
      errors.push({
        path: "$.status",
        code: "INVALID_SCHEMA",
        message:
          "status must be DRAFT, PUBLISHED or ARCHIVED"
      });
    }
  }

  private validateFields(
    schema: Record<string, unknown>,
    errors: SchemaValidationError[]
  ): Array<Record<string, unknown>> {
    const rawFields = schema.fields;

    if (!Array.isArray(rawFields)) {
      errors.push({
        path: "$.fields",
        code: "INVALID_SCHEMA",
        message:
          "fields must be an array"
      });

      return [];
    }

    const fields: Array<Record<string, unknown>> =
      [];

    const keys = new Set<string>();
    const orders = new Set<number>();

    rawFields.forEach(
      (rawField, index) => {
        const path =
          `$.fields[${index}]`;

        if (!isRecord(rawField)) {
          errors.push({
            path,
            code: "INVALID_SCHEMA",
            message:
              "Field must be an object"
          });

          return;
        }

        fields.push(rawField);

        const key = rawField.key;

        if (
          typeof key !== "string" ||
          key.trim() === ""
        ) {
          errors.push({
            path: `${path}.key`,
            code: "INVALID_FIELD_KEY",
            message:
              "Field key must be non-empty"
          });
        } else {
          if (!FIELD_KEY_PATTERN.test(key)) {
            errors.push({
              path: `${path}.key`,
              code: "INVALID_FIELD_KEY",
              message:
                "Field key must start with lowercase letter and contain only letters, numbers and underscores"
            });
          }

          if (keys.has(key)) {
            errors.push({
              path: `${path}.key`,
              code: "DUPLICATE_FIELD_KEY",
              message:
                `Duplicate field key: ${key}`
            });
          }

          keys.add(key);
        }

        if (
          typeof rawField.label !== "string" ||
          rawField.label.trim() === ""
        ) {
          errors.push({
            path: `${path}.label`,
            code: "INVALID_FIELD_LABEL",
            message:
              "Field label must be non-empty"
          });
        }

        const order = rawField.order;

        if (
          typeof order !== "number" ||
          !Number.isInteger(order) ||
          order < 0
        ) {
          errors.push({
            path: `${path}.order`,
            code: "INVALID_FIELD_ORDER",
            message:
              "Field order must be a non-negative integer"
          });
        } else if (orders.has(order)) {
          errors.push({
            path: `${path}.order`,
            code: "INVALID_FIELD_ORDER",
            message:
              `Duplicate field order: ${order}`
          });
        } else {
          orders.add(order);
        }

        this.validateFieldType(
          rawField,
          path,
          errors
        );

        this.validateFieldFlags(
          rawField,
          path,
          errors
        );

        this.validateFieldDefault(
          rawField,
          path,
          errors
        );
      }
    );

    return fields;
  }

  private validateFieldType(
    field: Record<string, unknown>,
    path: string,
    errors: SchemaValidationError[]
  ): void {
    const type = field.fieldType;

    if (
      typeof type !== "string" ||
      !fieldTypeRegistry.has(type)
    ) {
      errors.push({
        path: `${path}.fieldType`,
        code: "INVALID_FIELD_TYPE",
        message:
          `Unknown field type: ${String(type)}`
      });

      return;
    }

    const definition =
      fieldTypeRegistry.get(
        type as FieldType
      );

    const optionErrors =
      definition.validateOptions(
        field.options as FieldOptions | undefined
      );

    for (const message of optionErrors) {
      errors.push({
        path: `${path}.options`,
        code: "INVALID_FIELD_OPTIONS",
        message
      });
    }
  }

  private validateFieldFlags(
    field: Record<string, unknown>,
    path: string,
    errors: SchemaValidationError[]
  ): void {
    if (
      field.required !== undefined &&
      typeof field.required !== "boolean"
    ) {
      errors.push({
        path: `${path}.required`,
        code: "INVALID_REQUIRED_CONFIGURATION",
        message:
          "required must be boolean"
      });
    }

    if (
      field.translatable !== undefined &&
      typeof field.translatable !== "boolean"
    ) {
      errors.push({
        path: `${path}.translatable`,
        code: "INVALID_TRANSLATION_CONFIGURATION",
        message:
          "translatable must be boolean"
      });
    }

    if (
      field.helpText !== undefined &&
      typeof field.helpText !== "string"
    ) {
      errors.push({
        path: `${path}.helpText`,
        code: "INVALID_SCHEMA",
        message:
          "helpText must be string"
      });
    }
  }

  private validateFieldDefault(
    field: Record<string, unknown>,
    path: string,
    errors: SchemaValidationError[]
  ): void {
    if (
      field.defaultValue === undefined
    ) {
      return;
    }

    const type =
      field.fieldType;

    if (
      typeof type !== "string" ||
      !fieldTypeRegistry.has(type)
    ) {
      return;
    }

    const definition =
      fieldTypeRegistry.get(
        type as FieldType
      );

    const defaultErrors =
      definition.validateDefaultValue(
        field.defaultValue,
        field.options as FieldOptions | undefined
      );

    for (const message of defaultErrors) {
      errors.push({
        path: `${path}.defaultValue`,
        code: "INVALID_DEFAULT_VALUE",
        message
      });
    }
  }

  private validateSections(
    schema: Record<string, unknown>,
    fields: Array<Record<string, unknown>>,
    errors: SchemaValidationError[]
  ): void {
    const sections = schema.sections;

    if (sections === undefined) {
      return;
    }

    if (!Array.isArray(sections)) {
      errors.push({
        path: "$.sections",
        code: "INVALID_SECTION",
        message:
          "sections must be an array"
      });

      return;
    }

    const fieldKeys = new Set(
      fields
        .map(field => field.key)
        .filter(
          (key): key is string =>
            typeof key === "string"
        )
    );

    const sectionKeys = new Set<string>();
    const sectionOrders = new Set<number>();

    sections.forEach(
      (rawSection, index) => {
        const path =
          `$.sections[${index}]`;

        if (!isRecord(rawSection)) {
          errors.push({
            path,
            code: "INVALID_SECTION",
            message:
              "Section must be an object"
          });

          return;
        }

        const key = rawSection.key;

        if (
          typeof key !== "string" ||
          key.trim() === ""
        ) {
          errors.push({
            path: `${path}.key`,
            code: "INVALID_SECTION",
            message:
              "Section key must be non-empty"
          });
        } else if (sectionKeys.has(key)) {
          errors.push({
            path: `${path}.key`,
            code: "DUPLICATE_SECTION_KEY",
            message:
              `Duplicate section key: ${key}`
          });
        } else {
          sectionKeys.add(key);
        }

        if (
          typeof rawSection.label !== "string" ||
          rawSection.label.trim() === ""
        ) {
          errors.push({
            path: `${path}.label`,
            code: "INVALID_SECTION",
            message:
              "Section label must be non-empty"
          });
        }

        const order = rawSection.order;

        if (
          typeof order !== "number" ||
          !Number.isInteger(order) ||
          order < 0
        ) {
          errors.push({
            path: `${path}.order`,
            code: "INVALID_SECTION",
            message:
              "Section order must be a non-negative integer"
          });
        } else if (
          sectionOrders.has(order)
        ) {
          errors.push({
            path: `${path}.order`,
            code: "INVALID_SECTION",
            message:
              `Duplicate section order: ${order}`
          });
        } else {
          sectionOrders.add(order);
        }

        if (!Array.isArray(rawSection.fieldKeys)) {
          errors.push({
            path: `${path}.fieldKeys`,
            code: "INVALID_SECTION",
            message:
              "fieldKeys must be an array"
          });

          return;
        }

        const referenced =
          new Set<string>();

        rawSection.fieldKeys.forEach(
          (fieldKey, fieldIndex) => {
            const fieldPath =
              `${path}.fieldKeys[${fieldIndex}]`;

            if (
              typeof fieldKey !== "string" ||
              fieldKey.trim() === ""
            ) {
              errors.push({
                path: fieldPath,
                code: "INVALID_SECTION",
                message:
                  "Field reference must be non-empty"
              });

              return;
            }

            if (
              !fieldKeys.has(fieldKey)
            ) {
              errors.push({
                path: fieldPath,
                code: "UNKNOWN_FIELD_REFERENCE",
                message:
                  `Unknown field reference: ${fieldKey}`
              });
            }

            if (referenced.has(fieldKey)) {
              errors.push({
                path: fieldPath,
                code: "INVALID_SECTION",
                message:
                  `Field ${fieldKey} appears more than once in section`
              });
            }

            referenced.add(fieldKey);
          }
        );
      }
    );
  }

  private validateRelations(
    schema: Record<string, unknown>,
    fields: Array<Record<string, unknown>>,
    context: TemplateValidationContext,
    errors: SchemaValidationError[]
  ): void {
    const currentSlug =
      isRecord(schema.metadata)
        ? schema.metadata.slug
        : undefined;

    if (typeof currentSlug !== "string") {
      return;
    }

    for (const [index, field] of fields.entries()) {
      if (field.fieldType !== "RELATION") {
        continue;
      }

      const options = field.options;

      if (!isRecord(options)) {
        continue;
      }

      const target =
        options.targetTemplateSlug;

      if (typeof target !== "string") {
        continue;
      }

      const allowSelf =
        options.allowSelf === true;

      if (
        target === currentSlug &&
        !allowSelf
      ) {
        errors.push({
          path:
            `$.fields[${index}].options.targetTemplateSlug`,
          code: "SELF_RELATION",
          message:
            `Relation field "${String(
              field.key
            )}" points to its own template`
        });
      }
    }

    if (!context.schemas) {
      return;
    }

    this.detectRelationCycle(
      currentSlug,
      context.schemas,
      errors
    );
  }

  private detectRelationCycle(
    startSlug: string,
    schemas: Map<string, TemplateSchema>,
    errors: SchemaValidationError[]
  ): void {
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (
      slug: string,
      path: string[]
    ): void => {
      if (visiting.has(slug)) {
        const cycleStart =
          path.indexOf(slug);

        const cycle =
          cycleStart >= 0
            ? [...path.slice(cycleStart), slug]
            : [...path, slug];

        errors.push({
          path: "$.fields",
          code: "CIRCULAR_RELATION",
          message:
            `Circular relation detected: ${cycle.join(
              " -> "
            )}`
        });

        return;
      }

      if (visited.has(slug)) {
        return;
      }

      const template =
        schemas.get(slug);

      if (!template) {
        return;
      }

      visiting.add(slug);

      for (const field of template.fields) {
        if (field.fieldType !== "RELATION") {
          continue;
        }

        const options = field.options;

        if (!isRecord(options)) {
          continue;
        }

        const target =
          options.targetTemplateSlug;

        if (
          typeof target !== "string" ||
          options.allowSelf === true
        ) {
          continue;
        }

        visit(
          target,
          [...path, slug]
        );
      }

      visiting.delete(slug);
      visited.add(slug);
    };

    visit(startSlug, []);
  }
}
