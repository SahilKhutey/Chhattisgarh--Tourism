import { createField } from "../fieldFactory";

describe("createField", () => {
  it("creates unique field key when base already exists", () => {
    const field1 = createField("TEXT", []);
    expect(field1.key).toBe("text");
    expect(field1.order).toBe(0);

    const field2 = createField("TEXT", ["text"]);
    expect(field2.key).toBe("text_2");
    expect(field2.order).toBe(1);

    const field3 = createField("TEXT", ["text", "text_2"]);
    expect(field3.key).toBe("text_3");
    expect(field3.order).toBe(2);
  });

  it("locks alt text requirement for images and galleries", () => {
    const imageField = createField("IMAGE", []);
    expect(imageField.config.require_alt_text).toBe(true);

    const galleryField = createField("GALLERY", []);
    expect(galleryField.config.require_alt_text).toBe(true);

    const textField = createField("TEXT", []);
    expect(textField.config.require_alt_text).toBeUndefined();
  });

  it("formats human-readable labels correctly", () => {
    const geoField = createField("GEO_POINT", []);
    expect(geoField.label).toBe("Geo Point");

    const multiSelectField = createField("MULTI_SELECT", []);
    expect(multiSelectField.label).toBe("Multi Select");
  });
});
