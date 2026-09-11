"use client";

import type {
  TemplateField,
} from "@/types/template";

interface Props {
  field: TemplateField;
  onChange: (
    patch: Partial<TemplateField>,
  ) => void;
  onRemove: () => void;
}

export function FieldEditor({
  field,
  onChange,
  onRemove,
}: Props) {
  const imageField =
    field.type === "IMAGE" ||
    field.type === "GALLERY";

  return (
    <section
      className="rounded-xl border bg-background p-5 shadow-xs"
      aria-label={`${field.label} field configuration`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            {field.type}
          </p>

          <h3 className="mt-1 font-semibold text-base">
            {field.label}
          </h3>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="rounded-md border px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 border-rose-200 transition-colors"
          aria-label={`Remove ${field.label}`}
        >
          Remove
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium">
            Field key
          </span>

          <input
            value={field.key}
            onChange={(event) =>
              onChange({
                key: event.target.value,
              })
            }
            className="mt-1 h-9 w-full rounded-md border px-3 text-sm bg-background"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium">
            Label
          </span>

          <input
            value={field.label}
            onChange={(event) =>
              onChange({
                label: event.target.value,
              })
            }
            className="mt-1 h-9 w-full rounded-md border px-3 text-sm bg-background"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium">
            Group
          </span>

          <input
            value={field.group ?? ""}
            onChange={(event) =>
              onChange({
                group: event.target.value || null,
              })
            }
            placeholder="Basic Information"
            className="mt-1 h-9 w-full rounded-md border px-3 text-sm bg-background"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium">
            Help text
          </span>

          <input
            value={field.helpText ?? ""}
            onChange={(event) =>
              onChange({
                helpText: event.target.value || null,
              })
            }
            className="mt-1 h-9 w-full rounded-md border px-3 text-sm bg-background"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-5 text-xs font-medium">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(event) =>
              onChange({
                required: event.target.checked,
              })
            }
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          <span>Required</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={field.translatable}
            onChange={(event) =>
              onChange({
                translatable: event.target.checked,
              })
            }
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          <span>Translatable</span>
        </label>

        {imageField && (
          <label className="flex items-center gap-2 cursor-not-allowed text-stone-500">
            <input
              type="checkbox"
              checked
              disabled
              readOnly
              className="rounded"
            />
            <span>Alt text required</span>
          </label>
        )}
      </div>

      <FieldSpecificConfiguration
        field={field}
        onChange={onChange}
      />
    </section>
  );
}

function FieldSpecificConfiguration({
  field,
  onChange,
}: {
  field: TemplateField;
  onChange: (
    patch: Partial<TemplateField>,
  ) => void;
}) {
  if (
    field.type === "DROPDOWN" ||
    field.type === "MULTI_SELECT"
  ) {
    return (
      <div className="mt-5">
        <label className="block">
          <span className="text-xs font-medium">
            Options (value|label per line)
          </span>

          <textarea
            rows={5}
            value={
              (field.config.options ?? [])
                .map(
                  (option) =>
                    `${option.value}|${option.label}`,
                )
                .join("\n")
            }
            onChange={(event) => {
              const options = event.target.value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => {
                  const [value, ...labelParts] =
                    line.split("|");
                  return {
                    value: value.trim(),
                    label:
                      labelParts.join("|").trim() ||
                      value.trim(),
                  };
                });

              onChange({
                config: {
                  ...field.config,
                  options,
                },
              });
            }}
            placeholder={"heritage|Heritage\nnature|Nature"}
            className="mt-1 w-full rounded-md border p-3 font-mono text-xs bg-background"
          />
        </label>
      </div>
    );
  }

  if (field.type === "RELATION") {
    return (
      <label className="mt-5 block">
        <span className="text-xs font-medium">
          Related template slug
        </span>

        <input
          value={
            field.config.relation_template_slug ?? ""
          }
          onChange={(event) =>
            onChange({
              config: {
                ...field.config,
                relation_template_slug:
                  event.target.value,
              },
            })
          }
          placeholder="destination"
          className="mt-1 h-9 w-full rounded-md border px-3 text-sm bg-background"
        />
      </label>
    );
  }

  if (field.type === "NUMBER") {
    return (
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <NumberInput
          label="Minimum"
          value={field.config.min}
          onChange={(value) =>
            onChange({
              config: {
                ...field.config,
                min: value,
              },
            })
          }
        />

        <NumberInput
          label="Maximum"
          value={field.config.max}
          onChange={(value) =>
            onChange({
              config: {
                ...field.config,
                max: value,
              },
            })
          }
        />

        <NumberInput
          label="Step"
          value={field.config.step}
          onChange={(value) =>
            onChange({
              config: {
                ...field.config,
                step: value,
              },
            })
          }
        />
      </div>
    );
  }

  if (field.type === "GEO_POINT") {
    return (
      <div className="mt-5 rounded-lg border p-3 bg-muted/20 text-xs">
        <p className="font-semibold text-stone-800">
          Geography (Point)
        </p>
        <p className="mt-1 text-muted-foreground">
          Coordinates are validated against Chhattisgarh bounds (17.5°N - 24.5°N, 80.0°E - 84.5°E).
        </p>
      </div>
    );
  }

  if (field.type === "MAP_REGION") {
    return (
      <div className="mt-5 rounded-lg border p-3 bg-muted/20 text-xs">
        <p className="font-semibold text-stone-800">
          Map Region
        </p>
        <p className="mt-1 text-muted-foreground">
          Region polygon geometry uses canonical Chhattisgarh geographic boundaries.
        </p>
      </div>
    );
  }

  return null;
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (
    value: number | undefined,
  ) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium">
        {label}
      </span>

      <input
        type="number"
        value={value ?? ""}
        onChange={(event) =>
          onChange(
            event.target.value === ""
              ? undefined
              : Number(event.target.value),
          )
        }
        className="mt-1 h-9 w-full rounded-md border px-3 text-sm bg-background"
      />
    </label>
  );
}
