import type { ContentUIModel } from "./types";

export type ContentValidationResult =
  | {
      valid: true;
      model: ContentUIModel;
    }
  | {
      valid: false;
      errors: string[];
    };

export function validateContentUIModel(
  value: unknown,
): ContentValidationResult {
  if (!value || typeof value !== "object") {
    return {
      valid: false,
      errors: ["Content model must be an object."],
    };
  }

  const model = value as Partial<ContentUIModel>;
  const errors: string[] = [];

  if (!model.templateId) {
    errors.push("templateId is required.");
  }

  if (!model.entryId) {
    errors.push("entryId is required.");
  }

  if (!model.locale) {
    errors.push("locale is required.");
  }

  if (!model.title) {
    errors.push("title is required.");
  }

  if (!Array.isArray(model.sections)) {
    errors.push("sections must be an array.");
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  return {
    valid: true,
    model: model as ContentUIModel,
  };
}
