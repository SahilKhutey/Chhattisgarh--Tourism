interface Props {
  filtered: boolean;
  onCreate: () => void;
}

export function TemplateEmptyState({
  filtered,
  onCreate,
}: Props) {
  return (
    <div className="rounded-xl border border-dashed p-12 text-center bg-background">
      <h2 className="text-lg font-semibold">
        {filtered
          ? "No templates found"
          : "No templates yet"}
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        {filtered
          ? "Try changing your search or filters."
          : "Create your first tourism content template."}
      </p>

      {!filtered && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted/10 transition-colors"
        >
          Create template
        </button>
      )}
    </div>
  );
}
