"use client";

interface Props {
  search: string;
  status: string;
  category: string;

  onSearchChange: (
    value: string
  ) => void;

  onStatusChange: (
    value: string
  ) => void;

  onCategoryChange: (
    value: string
  ) => void;
}

export function TemplateFilters({
  search,
  status,
  category,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
}: Props) {
  return (
    <div
      className="flex flex-col gap-3 md:flex-row"
      role="search"
      aria-label="Filter templates"
    >
      <input
        value={search}
        onChange={(event) =>
          onSearchChange(
            event.target.value
          )
        }
        placeholder="Search templates..."
        aria-label="Search templates"
        className="h-10 flex-1 rounded-md border px-3 bg-background"
      />

      <select
        value={status}
        onChange={(event) =>
          onStatusChange(
            event.target.value
          )
        }
        aria-label="Filter by status"
        className="h-10 rounded-md border px-3 bg-background"
      >
        <option value="">
          All statuses
        </option>

        <option value="DRAFT">
          Draft
        </option>

        <option value="PUBLISHED">
          Published
        </option>

        <option value="ARCHIVED">
          Archived
        </option>
      </select>

      <input
        value={category}
        onChange={(event) =>
          onCategoryChange(
            event.target.value
          )
        }
        placeholder="Category"
        aria-label="Filter by category"
        className="h-10 rounded-md border px-3 bg-background"
      />
    </div>
  );
}
