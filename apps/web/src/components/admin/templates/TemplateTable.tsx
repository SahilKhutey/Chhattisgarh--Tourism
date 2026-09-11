"use client";

import Link from "next/link";

import type {
  AdminTemplateItem,
} from "@/types/admin-template";

import {
  TemplateStatusBadge,
} from "./TemplateStatusBadge";

interface Props {
  templates: AdminTemplateItem[];
}

export function TemplateTable({
  templates,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-background">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left">
            <th className="px-4 py-3 font-medium">
              Name
            </th>

            <th className="px-4 py-3 font-medium">
              Category
            </th>

            <th className="px-4 py-3 font-medium">
              Fields
            </th>

            <th className="px-4 py-3 font-medium">
              Status
            </th>

            <th className="px-4 py-3 font-medium">
              Updated
            </th>

            <th className="px-4 py-3">
              <span className="sr-only">
                Actions
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          {templates.map((template) => (
            <tr
              key={template.id}
              className="border-b last:border-0 hover:bg-muted/10 transition-colors"
            >
              <td className="px-4 py-4">
                <div>
                  <Link
                    href={`/admin/templates/${template.id}/builder`}
                    className="font-medium hover:underline"
                  >
                    {template.name}
                  </Link>

                  <p className="text-xs text-muted-foreground">
                    {template.slug}
                  </p>
                </div>
              </td>

              <td className="px-4 py-4">
                {template.category ?? "—"}
              </td>

              <td className="px-4 py-4">
                {template.field_count}
              </td>

              <td className="px-4 py-4">
                <TemplateStatusBadge
                  status={template.status}
                />
              </td>

              <td className="px-4 py-4">
                {new Date(
                  template.updated_at
                ).toLocaleDateString()}
              </td>

              <td className="px-4 py-4 text-right">
                <Link
                  href={`/admin/templates/${template.id}/builder`}
                  className="font-medium hover:underline text-emerald-600"
                >
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
