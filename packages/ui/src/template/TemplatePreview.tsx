"use client";

import React from "react";

import type { Template } from "@cg-tourism/template-contract";

type Props = {
  template: Template;
};

export function TemplatePreview({
  template,
}: Props) {
  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">
          {template.metadata.name}
        </h1>

        {template.metadata.description && (
          <p className="mt-2 text-gray-600">
            {template.metadata.description}
          </p>
        )}
      </header>

      <div className="space-y-6">
        {template.fields
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((field) => (
            <div key={field.id}>
              <label className="mb-2 block font-medium">
                {field.label}
                {field.required && (
                  <span aria-hidden="true">
                    {" "}
                    *
                  </span>
                )}
              </label>

              <div className="rounded border p-3">
                {field.type}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
