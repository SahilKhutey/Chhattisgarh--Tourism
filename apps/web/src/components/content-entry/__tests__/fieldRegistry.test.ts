import { ENTRY_FIELD_REGISTRY } from "../fieldRegistry";

describe("ENTRY_FIELD_REGISTRY", () => {
  it("registers all standard tourism field types", () => {
    const requiredTypes = [
      "TEXT",
      "TEXTAREA",
      "RICHTEXT",
      "NUMBER",
      "BOOLEAN",
      "DATE",
      "DATETIME",
      "TIME",
      "DROPDOWN",
      "MULTI_SELECT",
      "TAGS",
      "IMAGE",
      "GALLERY",
      "GEO_POINT",
      "MAP_REGION",
      "RELATION",
      "VIDEO",
      "AUDIO",
    ];

    for (const fieldType of requiredTypes) {
      expect(ENTRY_FIELD_REGISTRY[fieldType]).toBeDefined();
      expect(typeof ENTRY_FIELD_REGISTRY[fieldType]).toBe("function");
    }
  });
});
