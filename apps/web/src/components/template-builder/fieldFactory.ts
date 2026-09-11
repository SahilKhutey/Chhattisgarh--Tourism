import type {
  TemplateField,
  TemplateFieldType,
} from "@/types/template";

function slugifyKey(
  value: string,
): string {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "_",
    )
    .replace(
      /^_+|_+$/g,
      "",
    );
}

export function createField(
  type: TemplateFieldType,
  existingKeys: string[],
): TemplateField {
  const base = slugifyKey(type);

  let key = base;
  let counter = 2;

  while (existingKeys.includes(key)) {
    key = `${base}_${counter}`;
    counter += 1;
  }

  const imageType =
    type === "IMAGE" ||
    type === "GALLERY";

  return {
    key,
    label: type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase(),
      ),
    type,
    required: false,
    translatable: true,
    order: existingKeys.length,
    group: null,
    helpText: null,
    config: imageType
      ? {
          require_alt_text: true,
        }
      : {},
  };
}
