import {
  describe,
  it
} from "node:test";

import assert from "node:assert/strict";

import {
  TemplateSchemaValidator,
  type TemplateSchema
} from "../src/index.js";

const validator =
  new TemplateSchemaValidator();

const validTemplate: TemplateSchema = {
  schemaVersion: 1,

  id: "tpl_destination",

  metadata: {
    name: "Destination",
    slug: "destination"
  },

  version: 1,

  status: "DRAFT",

  fields: [
    {
      key: "title",
      label: "Title",
      fieldType: "TEXT",
      required: true,
      order: 0
    },

    {
      key: "location",
      label: "Location",
      fieldType: "GEO_POINT",
      order: 1
    }
  ]
};

describe(
  "TemplateSchemaValidator",
  () => {
    it(
      "accepts a valid template",
      () => {
        const result =
          validator.validate(
            validTemplate
          );

        assert.equal(
          result.valid,
          true
        );

        assert.equal(
          result.errors.length,
          0
        );
      }
    );

    it(
      "rejects null schema",
      () => {
        const result =
          validator.validate(null);

        assert.equal(
          result.valid,
          false
        );

        assert.equal(
          result.errors[0]?.code,
          "INVALID_SCHEMA"
        );
      }
    );

    it(
      "rejects duplicate field keys",
      () => {
        const schema = {
          ...validTemplate,

          fields: [
            validTemplate.fields[0]!,
            {
              ...validTemplate.fields[1]!,
              key: "title"
            }
          ]
        };

        const result =
          validator.validate(schema);

        assert.equal(
          result.valid,
          false
        );

        assert.ok(
          result.errors.some(
            error =>
              error.code ===
              "DUPLICATE_FIELD_KEY"
          )
        );
      }
    );

    it(
      "rejects invalid field keys",
      () => {
        const schema = {
          ...validTemplate,

          fields: [
            {
              ...validTemplate.fields[0]!,
              key: "Title Name"
            }
          ]
        };

        const result =
          validator.validate(schema);

        assert.equal(
          result.valid,
          false
        );

        assert.ok(
          result.errors.some(
            error =>
              error.code ===
              "INVALID_FIELD_KEY"
          )
        );
      }
    );

    it(
      "rejects unknown field types",
      () => {
        const schema = {
          ...validTemplate,

          fields: [
            {
              ...validTemplate.fields[0]!,
              fieldType:
                "MAGIC_TOURISM_FIELD"
            }
          ]
        };

        const result =
          validator.validate(schema);

        assert.equal(
          result.valid,
          false
        );

        assert.ok(
          result.errors.some(
            error =>
              error.code ===
              "INVALID_FIELD_TYPE"
          )
        );
      }
    );

    it(
      "rejects duplicate field ordering",
      () => {
        const schema = {
          ...validTemplate,

          fields: [
            validTemplate.fields[0]!,
            {
              ...validTemplate.fields[1]!,
              order: 0
            }
          ]
        };

        const result =
          validator.validate(schema);

        assert.equal(
          result.valid,
          false
        );

        assert.ok(
          result.errors.some(
            error =>
              error.code ===
              "INVALID_FIELD_ORDER"
          )
        );
      }
    );

    it(
      "rejects invalid slug",
      () => {
        const schema = {
          ...validTemplate,

          metadata: {
            ...validTemplate.metadata,
            slug: "Destination Template!"
          }
        };

        const result =
          validator.validate(schema);

        assert.equal(
          result.valid,
          false
        );

        assert.ok(
          result.errors.some(
            error =>
              error.code ===
              "INVALID_SLUG"
          )
        );
      }
    );

    it(
      "rejects invalid template version",
      () => {
        const schema = {
          ...validTemplate,
          version: 0
        };

        const result =
          validator.validate(schema);

        assert.equal(
          result.valid,
          false
        );

        assert.ok(
          result.errors.some(
            error =>
              error.code ===
              "INVALID_TEMPLATE_VERSION"
          )
        );
      }
    );

    it(
      "rejects invalid schema version",
      () => {
        const schema = {
          ...validTemplate,
          schemaVersion: 999
        };

        const result =
          validator.validate(schema);

        assert.equal(
          result.valid,
          false
        );

        assert.ok(
          result.errors.some(
            error =>
              error.path ===
              "$.schemaVersion"
          )
        );
      }
    );

    it(
      "rejects empty field labels",
      () => {
        const schema = {
          ...validTemplate,

          fields: [
            {
              ...validTemplate.fields[0]!,
              label: ""
            }
          ]
        };

        const result =
          validator.validate(schema);

        assert.equal(
          result.valid,
          false
        );

        assert.ok(
          result.errors.some(
            error =>
              error.code ===
              "INVALID_FIELD_LABEL"
          )
        );
      }
    );

    it(
      "rejects invalid TEXT configuration",
      () => {
        const schema = {
          ...validTemplate,

          fields: [
            {
              ...validTemplate.fields[0]!,
              options: {
                validation: {
                  minLength: 100,
                  maxLength: 10
                }
              }
            }
          ]
        };

        const result =
          validator.validate(schema);

        assert.equal(
          result.valid,
          false
        );

        assert.ok(
          result.errors.some(
            error =>
              error.code ===
              "INVALID_FIELD_OPTIONS"
          )
        );
      }
    );

    it(
      "rejects invalid GEO_POINT bounds",
      () => {
        const schema = {
          ...validTemplate,

          fields: [
            {
              ...validTemplate.fields[1]!,
              options: {
                minLatitude: -100,
                maxLatitude: 100
              }
            }
          ]
        };

        const result =
          validator.validate(schema);

        assert.equal(
          result.valid,
          false
        );

        assert.ok(
          result.errors.some(
            error =>
              error.code ===
              "INVALID_FIELD_OPTIONS"
          )
        );
      }
    );

    it(
      "rejects invalid dropdown options",
      () => {
        const schema = {
          ...validTemplate,

          fields: [
            {
              key: "category",
              label: "Category",
              fieldType: "DROPDOWN",
              order: 0,
              options: {
                options: [
                  {
                    value: "festival",
                    label: "Festival"
                  },
                  {
                    value: "festival",
                    label: "Duplicate"
                  }
                ]
              }
            }
          ]
        };

        const result =
          validator.validate(schema);

        assert.equal(
          result.valid,
          false
        );

        assert.ok(
          result.errors.some(
            error =>
              error.code ===
              "INVALID_FIELD_OPTIONS"
          )
        );
      }
    );

    it(
      "rejects self relation by default",
      () => {
        const schema = {
          ...validTemplate,

          metadata: {
            name: "Story",
            slug: "story"
          },

          fields: [
            {
              key: "relatedStory",
              label: "Related Story",
              fieldType: "RELATION",
              order: 0,
              options: {
                targetTemplateSlug: "story"
              }
            }
          ]
        };

        const result =
          validator.validate(schema);

        assert.equal(
          result.valid,
          false
        );

        assert.ok(
          result.errors.some(
            error =>
              error.code ===
              "SELF_RELATION"
          )
        );
      }
    );

    it(
      "allows explicit self relation",
      () => {
        const schema = {
          ...validTemplate,

          metadata: {
            name: "Story",
            slug: "story"
          },

          fields: [
            {
              key: "relatedStory",
              label: "Related Story",
              fieldType: "RELATION",
              order: 0,
              options: {
                targetTemplateSlug: "story",
                allowSelf: true
              }
            }
          ]
        };

        const result =
          validator.validate(schema);

        assert.equal(
          result.valid,
          true
        );
      }
    );

    it(
      "rejects unknown section field references",
      () => {
        const schema = {
          ...validTemplate,

          sections: [
            {
              key: "basic",
              label: "Basic",
              order: 0,
              fieldKeys: [
                "title",
                "doesNotExist"
              ]
            }
          ]
        };

        const result =
          validator.validate(schema);

        assert.equal(
          result.valid,
          false
        );

        assert.ok(
          result.errors.some(
            error =>
              error.code ===
              "UNKNOWN_FIELD_REFERENCE"
          )
        );
      }
    );

    it(
      "rejects duplicate section keys",
      () => {
        const schema = {
          ...validTemplate,

          sections: [
            {
              key: "basic",
              label: "Basic",
              order: 0,
              fieldKeys: ["title"]
            },
            {
              key: "basic",
              label: "Another",
              order: 1,
              fieldKeys: ["location"]
            }
          ]
        };

        const result =
          validator.validate(schema);

        assert.equal(
          result.valid,
          false
        );

        assert.ok(
          result.errors.some(
            error =>
              error.code ===
              "DUPLICATE_SECTION_KEY"
          )
        );
      }
    );

    it(
      "detects circular template relations",
      () => {
        const templateA: TemplateSchema = {
          ...validTemplate,

          metadata: {
            name: "A",
            slug: "a"
          },

          fields: [
            {
              key: "b",
              label: "B",
              fieldType: "RELATION",
              order: 0,
              options: {
                targetTemplateSlug: "b"
              }
            }
          ]
        };

        const templateB: TemplateSchema = {
          ...validTemplate,

          metadata: {
            name: "B",
            slug: "b"
          },

          fields: [
            {
              key: "a",
              label: "A",
              fieldType: "RELATION",
              order: 0,
              options: {
                targetTemplateSlug: "a"
              }
            }
          ]
        };

        const schemas =
          new Map<string, TemplateSchema>([
            ["a", templateA],
            ["b", templateB]
          ]);

        const result =
          validator.validate(
            templateA,
            { schemas }
          );

        assert.equal(
          result.valid,
          false
        );

        assert.ok(
          result.errors.some(
            error =>
              error.code ===
              "CIRCULAR_RELATION"
          )
        );
      }
    );
  }
);
