import {
  describe,
  it
} from "node:test";

import assert from "node:assert/strict";

import {
  fieldTypeRegistry
} from "../src/index.js";

const expectedTypes = [
  "TEXT",
  "RICHTEXT",
  "IMAGE",
  "GALLERY",
  "GEO_POINT",
  "MAP_REGION",
  "DROPDOWN",
  "TAGS",
  "VIDEO",
  "AUDIO",
  "DATE",
  "NUMBER",
  "BOOLEAN",
  "RELATION"
] as const;

describe(
  "Field Type Registry",
  () => {
    it(
      "registers every canonical Phase 1 field type",
      () => {
        for (const type of expectedTypes) {
          assert.equal(
            fieldTypeRegistry.has(type),
            true,
            `Missing field type: ${type}`
          );
        }
      }
    );

    it(
      "does not contain duplicate definitions",
      () => {
        const types =
          fieldTypeRegistry.listTypes();

        assert.equal(
          new Set(types).size,
          types.length
        );
      }
    );

    it(
      "exposes metadata for every field type",
      () => {
        for (const type of expectedTypes) {
          const definition =
            fieldTypeRegistry.get(type);

          assert.equal(
            definition.type,
            type
          );

          assert.ok(
            definition.displayName.length > 0
          );

          assert.ok(
            definition.description.length > 0
          );

          assert.equal(
            typeof definition.validateOptions,
            "function"
          );

          assert.equal(
            typeof definition.validateDefaultValue,
            "function"
          );
        }
      }
    );

    it(
      "rejects duplicate registration",
      () => {
        assert.throws(
          () => {
            fieldTypeRegistry.register(
              fieldTypeRegistry.get("TEXT")
            );
          },
          /already registered/
        );
      }
    );
  }
);
