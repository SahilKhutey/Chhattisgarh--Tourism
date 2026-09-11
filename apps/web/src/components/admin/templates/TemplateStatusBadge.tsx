import type {
  AdminTemplateStatus,
} from "@/types/admin-template";

interface Props {
  status: AdminTemplateStatus;
}

export function TemplateStatusBadge({
  status,
}: Props) {
  const labels: Record<AdminTemplateStatus, string> = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    ARCHIVED: "Archived",
  };

  const colors: Record<AdminTemplateStatus, string> = {
    DRAFT: "border-amber-300 bg-amber-50 text-amber-800",
    PUBLISHED: "border-emerald-300 bg-emerald-50 text-emerald-800",
    ARCHIVED: "border-stone-300 bg-stone-50 text-stone-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${colors[status] || "border-stone-200"}`}
      aria-label={`Status: ${labels[status] || status}`}
    >
      {labels[status] || status}
    </span>
  );
}
