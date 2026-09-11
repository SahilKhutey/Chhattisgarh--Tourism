"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  createTemplate,
} from "@/lib/api/templates";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateTemplateDialog({
  open,
  onClose,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError(
        "Template name must contain at least 2 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const template = await createTemplate({
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        category: category.trim() || undefined,
        description: description.trim() || undefined,
      });

      onCreated(template.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create template."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-template-title"
    >
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-xl border bg-background p-6 shadow-xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2
              id="create-template-title"
              className="text-lg font-semibold"
            >
              Create template
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Start with template metadata. Fields are configured in the Builder.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">
              Name
            </span>

            <input
              required
              aria-label="Name"
              value={name}
              onChange={(event) => {
                const value = event.target.value;
                setName(value);
                if (!slug) {
                  setSlug(slugify(value));
                }
              }}
              className="mt-1 h-10 w-full rounded-md border px-3 bg-background"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">
              Slug
            </span>

            <input
              required
              aria-label="Slug"
              value={slug}
              onChange={(event) =>
                setSlug(
                  slugify(event.target.value)
                )
              }
              className="mt-1 h-10 w-full rounded-md border px-3 bg-background"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">
              Category
            </span>

            <input
              value={category}
              aria-label="Category"
              onChange={(event) =>
                setCategory(event.target.value)
              }
              placeholder="destination"
              className="mt-1 h-10 w-full rounded-md border px-3 bg-background"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">
              Description
            </span>

            <textarea
              value={description}
              aria-label="Description"
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={4}
              className="mt-1 w-full rounded-md border p-3 bg-background"
            />
          </label>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
          >
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-4 py-2 hover:bg-muted/10 transition-colors"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            type="submit"
            className="rounded-md border px-4 py-2 font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {loading
              ? "Creating..."
              : "Create template"}
          </button>
        </div>
      </form>
    </div>
  );
}
