import type {
  FieldOptions,
  FieldType,
  TemplateField
} from "./types.js";

export interface FieldTypeDefinition<
  TOptions extends FieldOptions = FieldOptions
> {
  readonly type: FieldType;

  readonly displayName: string;

  readonly description: string;

  readonly defaultTranslatable: boolean;

  validateOptions(
    options: TOptions | undefined
  ): string[];

  validateDefaultValue(
    value: unknown,
    options: TOptions | undefined
  ): string[];
}

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value);

const isInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value);

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isString = (value: unknown): value is string =>
  typeof value === "string";

const validateMimeTypes = (
  value: unknown,
  path: string
): string[] => {
  if (value === undefined) {
    return [];
  }

  if (
    !Array.isArray(value) ||
    value.some(
      item => typeof item !== "string" || item.trim() === ""
    )
  ) {
    return [`${path} must be an array of non-empty strings`];
  }

  return [];
};

const validateBounds = (
  options: Record<string, unknown>,
  errors: string[]
): void => {
  if (
    options.min !== undefined &&
    !isNumber(options.min)
  ) {
    errors.push("options.min must be a finite number");
  }

  if (
    options.max !== undefined &&
    !isNumber(options.max)
  ) {
    errors.push("options.max must be a finite number");
  }

  if (
    isNumber(options.min) &&
    isNumber(options.max) &&
    options.min > options.max
  ) {
    errors.push("options.min cannot be greater than options.max");
  }
};

const validateTextOptions = (
  options: FieldOptions
): string[] => {
  if (options === undefined) {
    return [];
  }

  if (!isRecord(options)) {
    return ["options must be an object"];
  }

  const errors: string[] = [];

  if (
    options.multiline !== undefined &&
    typeof options.multiline !== "boolean"
  ) {
    errors.push("options.multiline must be boolean");
  }

  if (
    options.placeholder !== undefined &&
    !isString(options.placeholder)
  ) {
    errors.push("options.placeholder must be a string");
  }

  if (options.validation !== undefined) {
    if (!isRecord(options.validation)) {
      errors.push("options.validation must be an object");
    } else {
      const validation = options.validation;

      if (
        validation.minLength !== undefined &&
        !isInteger(validation.minLength)
      ) {
        errors.push(
          "options.validation.minLength must be an integer"
        );
      }

      if (
        validation.maxLength !== undefined &&
        !isInteger(validation.maxLength)
      ) {
        errors.push(
          "options.validation.maxLength must be an integer"
        );
      }

      if (
        isInteger(validation.minLength) &&
        isInteger(validation.maxLength) &&
        validation.minLength > validation.maxLength
      ) {
        errors.push(
          "options.validation.minLength cannot exceed maxLength"
        );
      }

      if (
        validation.pattern !== undefined &&
        !isString(validation.pattern)
      ) {
        errors.push(
          "options.validation.pattern must be a string"
        );
      }
    }
  }

  return errors;
};

const validateRichTextOptions = (
  options: FieldOptions
): string[] => {
  if (options === undefined) {
    return [];
  }

  if (!isRecord(options)) {
    return ["options must be an object"];
  }

  if (options.allowedFormats === undefined) {
    return [];
  }

  if (!Array.isArray(options.allowedFormats)) {
    return ["options.allowedFormats must be an array"];
  }

  const allowed = new Set([
    "bold",
    "italic",
    "underline",
    "heading",
    "link",
    "list",
    "quote"
  ]);

  return options.allowedFormats
    .filter(
      format =>
        typeof format !== "string" ||
        !allowed.has(format)
    )
    .map(
      format =>
        `Invalid rich text format: ${String(format)}`
    );
};

const validateImageOptions = (
  options: FieldOptions
): string[] => {
  if (options === undefined) {
    return [];
  }

  if (!isRecord(options)) {
    return ["options must be an object"];
  }

  const errors: string[] = [];

  if (
    options.maxSizeBytes !== undefined &&
    (!isInteger(options.maxSizeBytes) ||
      options.maxSizeBytes <= 0)
  ) {
    errors.push(
      "options.maxSizeBytes must be a positive integer"
    );
  }

  errors.push(
    ...validateMimeTypes(
      options.acceptedMimeTypes,
      "options.acceptedMimeTypes"
    )
  );

  if (
    options.requireAltText !== undefined &&
    typeof options.requireAltText !== "boolean"
  ) {
    errors.push("options.requireAltText must be boolean");
  }

  return errors;
};

const validateGalleryOptions = (
  options: FieldOptions
): string[] => {
  if (options === undefined) {
    return [];
  }

  if (!isRecord(options)) {
    return ["options must be an object"];
  }

  const errors: string[] = [];

  if (
    options.minItems !== undefined &&
    (!isInteger(options.minItems) ||
      options.minItems < 0)
  ) {
    errors.push("options.minItems must be a non-negative integer");
  }

  if (
    options.maxItems !== undefined &&
    (!isInteger(options.maxItems) ||
      options.maxItems < 0)
  ) {
    errors.push("options.maxItems must be a non-negative integer");
  }

  if (
    isInteger(options.minItems) &&
    isInteger(options.maxItems) &&
    options.minItems > options.maxItems
  ) {
    errors.push("options.minItems cannot exceed maxItems");
  }

  if (options.image !== undefined) {
    errors.push(
      ...validateImageOptions(options.image as FieldOptions)
    );
  }

  return errors;
};

const validateGeoPointOptions = (
  options: FieldOptions
): string[] => {
  if (options === undefined) {
    return [];
  }

  if (!isRecord(options)) {
    return ["options must be an object"];
  }

  const errors: string[] = [];

  const numericKeys = [
    "minLatitude",
    "maxLatitude",
    "minLongitude",
    "maxLongitude",
    "requiredAccuracyMeters"
  ];

  for (const key of numericKeys) {
    const value = options[key];

    if (
      value !== undefined &&
      !isNumber(value)
    ) {
      errors.push(
        `options.${key} must be a finite number`
      );
    }
  }

  if (
    isNumber(options.minLatitude) &&
    (options.minLatitude < -90 ||
      options.minLatitude > 90)
  ) {
    errors.push(
      "options.minLatitude must be between -90 and 90"
    );
  }

  if (
    isNumber(options.maxLatitude) &&
    (options.maxLatitude < -90 ||
      options.maxLatitude > 90)
  ) {
    errors.push(
      "options.maxLatitude must be between -90 and 90"
    );
  }

  if (
    isNumber(options.minLongitude) &&
    (options.minLongitude < -180 ||
      options.minLongitude > 180)
  ) {
    errors.push(
      "options.minLongitude must be between -180 and 180"
    );
  }

  if (
    isNumber(options.maxLongitude) &&
    (options.maxLongitude < -180 ||
      options.maxLongitude > 180)
  ) {
    errors.push(
      "options.maxLongitude must be between -180 and 180"
    );
  }

  if (
    isNumber(options.minLatitude) &&
    isNumber(options.maxLatitude) &&
    options.minLatitude > options.maxLatitude
  ) {
    errors.push(
      "options.minLatitude cannot exceed maxLatitude"
    );
  }

  if (
    isNumber(options.minLongitude) &&
    isNumber(options.maxLongitude) &&
    options.minLongitude > options.maxLongitude
  ) {
    errors.push(
      "options.minLongitude cannot exceed maxLongitude"
    );
  }

  if (
    isNumber(options.requiredAccuracyMeters) &&
    options.requiredAccuracyMeters <= 0
  ) {
    errors.push(
      "options.requiredAccuracyMeters must be greater than zero"
    );
  }

  return errors;
};

const validateMapRegionOptions = (
  options: FieldOptions
): string[] => {
  if (options === undefined) {
    return [];
  }

  if (!isRecord(options)) {
    return ["options must be an object"];
  }

  if (options.allowedGeometryTypes === undefined) {
    return [];
  }

  if (!Array.isArray(options.allowedGeometryTypes)) {
    return [
      "options.allowedGeometryTypes must be an array"
    ];
  }

  const allowed = new Set([
    "Polygon",
    "MultiPolygon"
  ]);

  return options.allowedGeometryTypes
    .filter(
      type =>
        typeof type !== "string" ||
        !allowed.has(type)
    )
    .map(
      type =>
        `Invalid geometry type: ${String(type)}`
    );
};

const validateDropdownOptions = (
  options: FieldOptions
): string[] => {
  if (!isRecord(options)) {
    return ["options must be an object"];
  }

  if (!Array.isArray(options.options)) {
    return ["options.options must be an array"];
  }

  const errors: string[] = [];
  const values = new Set<string>();

  options.options.forEach((option, index) => {
    if (!isRecord(option)) {
      errors.push(
        `options.options[${index}] must be an object`
      );
      return;
    }

    if (
      typeof option.value !== "string" ||
      option.value.trim() === ""
    ) {
      errors.push(
        `options.options[${index}].value must be non-empty`
      );
    }

    if (typeof option.label !== "string" &&
        !isRecord(option.label)) {
      errors.push(
        `options.options[${index}].label must be string or localized object`
      );
    }

    if (
      typeof option.value === "string" &&
      values.has(option.value)
    ) {
      errors.push(
        `Duplicate dropdown value: ${option.value}`
      );
    }

    if (typeof option.value === "string") {
      values.add(option.value);
    }
  });

  if (
    options.allowMultiple !== undefined &&
    typeof options.allowMultiple !== "boolean"
  ) {
    errors.push("options.allowMultiple must be boolean");
  }

  return errors;
};

const validateTagsOptions = (
  options: FieldOptions
): string[] => {
  if (options === undefined) {
    return [];
  }

  if (!isRecord(options)) {
    return ["options must be an object"];
  }

  const errors: string[] = [];

  for (const key of ["minItems", "maxItems"]) {
    const value = options[key];

    if (
      value !== undefined &&
      (!isInteger(value) || value < 0)
    ) {
      errors.push(
        `options.${key} must be a non-negative integer`
      );
    }
  }

  if (
    isInteger(options.minItems) &&
    isInteger(options.maxItems) &&
    options.minItems > options.maxItems
  ) {
    errors.push("options.minItems cannot exceed maxItems");
  }

  if (
    options.allowCustom !== undefined &&
    typeof options.allowCustom !== "boolean"
  ) {
    errors.push("options.allowCustom must be boolean");
  }

  return errors;
};

const validateMediaOptions = (
  options: FieldOptions
): string[] => {
  if (options === undefined) {
    return [];
  }

  if (!isRecord(options)) {
    return ["options must be an object"];
  }

  const errors = validateMimeTypes(
    options.acceptedMimeTypes,
    "options.acceptedMimeTypes"
  );

  if (
    options.maxSizeBytes !== undefined &&
    (!isInteger(options.maxSizeBytes) ||
      options.maxSizeBytes <= 0)
  ) {
    errors.push(
      "options.maxSizeBytes must be a positive integer"
    );
  }

  if (
    options.maxDurationSeconds !== undefined &&
    (!isNumber(options.maxDurationSeconds) ||
      options.maxDurationSeconds <= 0)
  ) {
    errors.push(
      "options.maxDurationSeconds must be greater than zero"
    );
  }

  return errors;
};

const validateDateOptions = (
  options: FieldOptions
): string[] => {
  if (options === undefined) {
    return [];
  }

  if (!isRecord(options)) {
    return ["options must be an object"];
  }

  const errors: string[] = [];

  if (
    options.includeTime !== undefined &&
    typeof options.includeTime !== "boolean"
  ) {
    errors.push("options.includeTime must be boolean");
  }

  for (const key of ["minDate", "maxDate"]) {
    const value = options[key];

    if (
      value !== undefined &&
      (typeof value !== "string" ||
        Number.isNaN(Date.parse(value)))
    ) {
      errors.push(
        `options.${key} must be a valid ISO date`
      );
    }
  }

  if (
    typeof options.minDate === "string" &&
    typeof options.maxDate === "string" &&
    Date.parse(options.minDate) > Date.parse(options.maxDate)
  ) {
    errors.push(
      "options.minDate cannot exceed options.maxDate"
    );
  }

  return errors;
};

const validateNumberOptions = (
  options: FieldOptions
): string[] => {
  if (options === undefined) {
    return [];
  }

  if (!isRecord(options)) {
    return ["options must be an object"];
  }

  const errors: string[] = [];

  validateBounds(options, errors);

  if (
    options.integerOnly !== undefined &&
    typeof options.integerOnly !== "boolean"
  ) {
    errors.push("options.integerOnly must be boolean");
  }

  if (
    options.unit !== undefined &&
    typeof options.unit !== "string"
  ) {
    errors.push("options.unit must be string");
  }

  return errors;
};

const validateBooleanOptions = (
  options: FieldOptions
): string[] => {
  if (options === undefined) {
    return [];
  }

  if (!isRecord(options)) {
    return ["options must be an object"];
  }

  const errors: string[] = [];

  for (const key of ["trueLabel", "falseLabel"]) {
    const value = options[key];

    if (
      value !== undefined &&
      typeof value !== "string" &&
      !isRecord(value)
    ) {
      errors.push(
        `options.${key} must be string or localized object`
      );
    }
  }

  return errors;
};

const validateRelationOptions = (
  options: FieldOptions
): string[] => {
  if (!isRecord(options)) {
    return ["options must be an object"];
  }

  const errors: string[] = [];

  if (
    typeof options.targetTemplateSlug !== "string" ||
    options.targetTemplateSlug.trim() === ""
  ) {
    errors.push(
      "options.targetTemplateSlug must be non-empty"
    );
  }

  if (
    options.multiple !== undefined &&
    typeof options.multiple !== "boolean"
  ) {
    errors.push("options.multiple must be boolean");
  }

  if (
    options.allowSelf !== undefined &&
    typeof options.allowSelf !== "boolean"
  ) {
    errors.push("options.allowSelf must be boolean");
  }

  return errors;
};

const noOptions = (
  options: FieldOptions
): string[] => {
  if (options === undefined) {
    return [];
  }

  if (!isRecord(options)) {
    return ["options must be an object"];
  }

  return [];
};

const stringDefault = (
  value: unknown
): string[] =>
  value === undefined || typeof value === "string"
    ? []
    : ["defaultValue must be a string"];

const booleanDefault = (
  value: unknown
): string[] =>
  value === undefined || typeof value === "boolean"
    ? []
    : ["defaultValue must be boolean"];

const numberDefault = (
  value: unknown
): string[] =>
  value === undefined || isNumber(value)
    ? []
    : ["defaultValue must be a finite number"];

const arrayDefault = (
  value: unknown
): string[] =>
  value === undefined || Array.isArray(value)
    ? []
    : ["defaultValue must be an array"];

const objectDefault = (
  value: unknown
): string[] =>
  value === undefined || isRecord(value)
    ? []
    : ["defaultValue must be an object"];

export const FIELD_TYPE_DEFINITIONS:
  Record<FieldType, FieldTypeDefinition> = {

  TEXT: {
    type: "TEXT",
    displayName: "Text",
    description: "Plain text content.",
    defaultTranslatable: true,
    validateOptions: validateTextOptions,
    validateDefaultValue: stringDefault
  },

  RICHTEXT: {
    type: "RICHTEXT",
    displayName: "Rich Text",
    description: "Formatted long-form content.",
    defaultTranslatable: true,
    validateOptions: validateRichTextOptions,
    validateDefaultValue: stringDefault
  },

  IMAGE: {
    type: "IMAGE",
    displayName: "Image",
    description: "Single image asset.",
    defaultTranslatable: false,
    validateOptions: validateImageOptions,
    validateDefaultValue: objectDefault
  },

  GALLERY: {
    type: "GALLERY",
    displayName: "Gallery",
    description: "Collection of images.",
    defaultTranslatable: false,
    validateOptions: validateGalleryOptions,
    validateDefaultValue: arrayDefault
  },

  GEO_POINT: {
    type: "GEO_POINT",
    displayName: "Geographic Point",
    description: "Latitude and longitude location.",
    defaultTranslatable: false,
    validateOptions: validateGeoPointOptions,
    validateDefaultValue: objectDefault
  },

  MAP_REGION: {
    type: "MAP_REGION",
    displayName: "Map Region",
    description: "Geographic polygon or multipolygon.",
    defaultTranslatable: false,
    validateOptions: validateMapRegionOptions,
    validateDefaultValue: objectDefault
  },

  DROPDOWN: {
    type: "DROPDOWN",
    displayName: "Dropdown",
    description: "Configured selectable options.",
    defaultTranslatable: true,
    validateOptions: validateDropdownOptions,
    validateDefaultValue: stringDefault
  },

  TAGS: {
    type: "TAGS",
    displayName: "Tags",
    description: "Collection of taxonomy tags.",
    defaultTranslatable: false,
    validateOptions: validateTagsOptions,
    validateDefaultValue: arrayDefault
  },

  VIDEO: {
    type: "VIDEO",
    displayName: "Video",
    description: "Video media asset.",
    defaultTranslatable: false,
    validateOptions: validateMediaOptions,
    validateDefaultValue: objectDefault
  },

  AUDIO: {
    type: "AUDIO",
    displayName: "Audio",
    description: "Audio media asset.",
    defaultTranslatable: false,
    validateOptions: validateMediaOptions,
    validateDefaultValue: objectDefault
  },

  DATE: {
    type: "DATE",
    displayName: "Date",
    description: "Date or date-time value.",
    defaultTranslatable: false,
    validateOptions: validateDateOptions,
    validateDefaultValue: stringDefault
  },

  NUMBER: {
    type: "NUMBER",
    displayName: "Number",
    description: "Numeric value.",
    defaultTranslatable: false,
    validateOptions: validateNumberOptions,
    validateDefaultValue: numberDefault
  },

  BOOLEAN: {
    type: "BOOLEAN",
    displayName: "Boolean",
    description: "True/false value.",
    defaultTranslatable: false,
    validateOptions: validateBooleanOptions,
    validateDefaultValue: booleanDefault
  },

  RELATION: {
    type: "RELATION",
    displayName: "Relation",
    description: "Reference to another content template.",
    defaultTranslatable: false,
    validateOptions: validateRelationOptions,
    validateDefaultValue: stringDefault
  }
};
