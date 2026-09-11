import React from "react";
import type { Template } from "@cg-tourism/template-contract";

type Props = {
  template: Template;
  data: Record<string, unknown>;
};

export function ContentRenderer({
  template,
  data,
}: Props) {
  return (
    <article>
      {template.fields
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((field) => {
          const value = data[field.key];

          if (
            value === undefined ||
            value === null ||
            value === ""
          ) {
            return null;
          }

          return (
            <section key={field.id}>
              <h2>{field.label}</h2>
              <div>
                {String(value)}
              </div>
            </section>
          );
        })}
    </article>
  );
}
