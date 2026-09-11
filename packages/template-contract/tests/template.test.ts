import { describe, it } from "node:test";
import assert from "node:assert";

import {
  FIELD_TYPES,
  type Template,
} from "../src/index.js";

describe("Template Contract", () => {
  it("contains the canonical field types", () => {
    assert(FIELD_TYPES.includes("TEXT"));
    assert(FIELD_TYPES.includes("IMAGE"));
    assert(FIELD_TYPES.includes("GEO_POINT"));
    assert(FIELD_TYPES.includes("MAP_REGION"));
    assert(FIELD_TYPES.includes("RELATION"));
  });

  it("allows a valid template structure", () => {
    const template: Template = {
      id: "template-1",
      metadata: {
        name: "Tourist Destination",
        slug: "tourist-destination",
      },
      status: "DRAFT",
      currentVersion: null,
      fields: [],
      groups: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    assert.strictEqual(template.status, "DRAFT");
  });
});
