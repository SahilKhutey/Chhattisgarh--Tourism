import {
  TEMPLATE_SCHEMA_VERSION,
  type TemplateSchema,
  type TemplateSerializationResult
} from "./types.js";

import { TemplateSchemaValidator } from "./validator.js";

export class TemplateSchemaSerializer {
  constructor(
    private readonly validator =
      new TemplateSchemaValidator()
  ) {}

  serialize(
    schema: TemplateSchema
  ): TemplateSerializationResult {
    const validation =
      this.validator.validate(schema);

    if (!validation.valid) {
      const message = validation.errors
        .map(
          error =>
            `${error.path}: ${error.message}`
        )
        .join("\n");

      throw new Error(
        `Cannot serialize invalid template schema:\n${message}`
      );
    }

    const canonical =
      this.canonicalize(schema);

    return {
      schema: canonical,
      json: JSON.stringify(
        canonical,
        null,
        2
      )
    };
  }

  deserialize(
    json: string
  ): TemplateSchema {
    let parsed: unknown;

    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error(
        "Template schema JSON is invalid"
      );
    }

    if (
      typeof parsed !== "object" ||
      parsed === null
    ) {
      throw new Error(
        "Template schema must deserialize to an object"
      );
    }

    const schema =
      parsed as TemplateSchema;

    if (
      schema.schemaVersion !==
      TEMPLATE_SCHEMA_VERSION
    ) {
      throw new Error(
        `Unsupported template schema version: ${String(
          schema.schemaVersion
        )}`
      );
    }

    const validation =
      this.validator.validate(schema);

    if (!validation.valid) {
      const message = validation.errors
        .map(
          error =>
            `${error.path}: ${error.message}`
        )
        .join("\n");

      throw new Error(
        `Cannot deserialize invalid template schema:\n${message}`
      );
    }

    return this.canonicalize(schema);
  }

  private canonicalize(
    schema: TemplateSchema
  ): TemplateSchema {
    const canonical: TemplateSchema = {
      schemaVersion:
        TEMPLATE_SCHEMA_VERSION,

      id: schema.id,

      metadata: {
        name: schema.metadata.name,
        slug: schema.metadata.slug,
        ...(schema.metadata.description !== undefined
          ? {
              description:
                schema.metadata.description
            }
          : {}),
        ...(schema.metadata.icon !== undefined
          ? {
              icon: schema.metadata.icon
            }
          : {}),
        ...(schema.metadata.category !== undefined
          ? {
              category:
                schema.metadata.category
            }
          : {})
      },

      version: schema.version,

      status: schema.status,

      fields: [...schema.fields]
        .sort(
          (a, b) => a.order - b.order
        )
        .map(field => ({
          ...field
        }))
    };

    if (schema.sections) {
      canonical.sections = [
        ...schema.sections
      ].sort(
        (a, b) => a.order - b.order
      );
    }

    return canonical;
  }
}
