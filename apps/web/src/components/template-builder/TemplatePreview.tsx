"use client";

import type {
  TemplateField,
} from "@/types/template";

interface Props {
  fields: TemplateField[];
}

export function TemplatePreview({
  fields,
}: Props) {
  const groups = fields.reduce<
    Record<string, TemplateField[]>
  >((result, field) => {
    const group = field.group ?? "General";
    result[group] ??= [];
    result[group].push(field);
    return result;
  }, {});

  return (
    <div
      className="rounded-xl border p-5 bg-background shadow-xs"
      aria-label="Content Preview"
    >
      <h2 className="text-base font-semibold tracking-tight">
        Content Preview
      </h2>

      <p className="mt-1 text-xs text-muted-foreground">
        Approximate consumer content form preview.
      </p>

      {fields.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed p-8 text-center text-xs text-muted-foreground">
          No fields added yet. Add fields from the palette to preview.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {Object.entries(groups).map(
            ([group, groupFields]) => (
              <section
                key={group}
                className="space-y-3"
              >
                <h3 className="font-semibold text-xs uppercase tracking-wider text-stone-500 border-b pb-1">
                  {group}
                </h3>

                <div className="space-y-3">
                  {groupFields.map((field) => (
                    <div key={field.key}>
                      <label className="text-xs font-medium text-stone-700 block">
                        {field.label}
                        {field.required && (
                          <span
                            aria-hidden="true"
                            className="ml-1 text-rose-500 font-bold"
                          >
                            *
                          </span>
                        )}
                      </label>

                      <PreviewControl field={field} />
                    </div>
                  ))}
                </div>
              </section>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function PreviewControl({
  field,
}: {
  field: TemplateField;
}) {
  if (field.type === "TEXT") {
    return (
      <input
        disabled
        placeholder={field.helpText ?? field.label}
        className="mt-1 h-9 w-full rounded-md border px-3 text-xs bg-muted/20 text-muted-foreground"
      />
    );
  }

  if (
    field.type === "TEXTAREA" ||
    field.type === "RICHTEXT"
  ) {
    return (
      <textarea
        disabled
        rows={3}
        placeholder={field.helpText ?? field.label}
        className="mt-1 w-full rounded-md border p-3 text-xs bg-muted/20 text-muted-foreground"
      />
    );
  }

  if (
    field.type === "DROPDOWN" ||
    field.type === "MULTI_SELECT"
  ) {
    return (
      <select
        disabled
        multiple={field.type === "MULTI_SELECT"}
        className="mt-1 min-h-9 w-full rounded-md border px-3 text-xs bg-muted/20 text-muted-foreground"
      >
        {(field.config.options ?? []).map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "BOOLEAN") {
    return (
      <div className="mt-2 flex items-center gap-2">
        <input
          disabled
          type="checkbox"
          className="rounded"
        />
        <span className="text-xs text-muted-foreground">
          {field.helpText ?? "Yes / No"}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-1 rounded-md border border-dashed p-2.5 text-xs text-muted-foreground bg-muted/10 font-mono">
      [{field.type}] {field.helpText ?? "Field placeholder"}
    </div>
  );
}
