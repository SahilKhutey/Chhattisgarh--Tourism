import {
  describe,
  it
} from "node:test";

import assert from "node:assert/strict";

import {
  TemplateSchemaSerializer,
  type TemplateSchema
} from "../src/index.js";

const serializer =
  new TemplateSchemaSerializer();

const schema: TemplateSchema = {
  schemaVersion: 1,

  id: "tpl_festival",

  metadata: {
    name: "Festival",
    slug: "festival",
    description:
      "Festival tourism content"
  },

  version: 2,

  status: "PUBLISHED",

  fields: [
    {
      key: "title",
      label: "Festival Name",
      fieldType: "TEXT",
      required: true,
      order: 1
    },

    {
      key: "eventDate",
      label: "Event Date",
      fieldType: "DATE",
      order: 0
    }
  ]
};

describe(
  "TemplateSchemaSerializer",
  () => {
    it(
      "serializes a valid schema",
      () => {
        const result =
          serializer.serialize(schema);

        assert.equal(
          typeof result.json,
          "string"
        );

        assert.ok(
          result.json.includes(
            '"schemaVersion": 1'
          )
        );
      }
    );

    it(
      "produces deterministic field ordering",
      () => {
        const result =
          serializer.serialize(schema);

        const parsed =
          JSON.parse(result.json);

        assert.equal(
          parsed.fields[0].key,
          "eventDate"
        );

        assert.equal(
          parsed.fields[1].key,
          "title"
        );
      }
    );

    it(
      "round trips without data loss",
      () => {
        const serialized =
          serializer.serialize(schema);

        const restored =
          serializer.deserialize(
            serialized.json
          );

        assert.deepEqual(
          restored,
          serialized.schema
        );
      }
    );

    it(
      "rejects malformed JSON",
      () => {
        assert.throws(
          () =>
            serializer.deserialize(
              "{not-valid-json"
            ),
          /JSON is invalid/
        );
      }
    );

    it(
      "rejects unsupported schema version",
      () => {
        const invalid = JSON.stringify({
          ...schema,
          schemaVersion: 99
        });

        assert.throws(
          () =>
            serializer.deserialize(
              invalid
            ),
          /Unsupported template schema version/
        );
      }
    );

    it(
      "rejects invalid schema during serialization",
      () => {
        const invalid = {
          ...schema,

          fields: [
            {
              key: "bad key",
              label: "Invalid",
              fieldType: "TEXT",
              order: 0
            }
          ]
        };

        assert.throws(
          () =>
            serializer.serialize(
              invalid as TemplateSchema
            ),
          /Cannot serialize invalid template schema/
        );
      }
    );
  }
);
