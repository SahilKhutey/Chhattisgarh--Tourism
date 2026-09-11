"use client";

import React, { useState } from "react";
import type { GlossaryTerm, GlossaryTranslation } from "@/types/glossary";

interface Props {
  initialData?: GlossaryTerm | null;
  onSave: (payload: Omit<GlossaryTerm, "id">) => Promise<void>;
  onCancel: () => void;
}

export function GlossaryEditor({ initialData, onSave, onCancel }: Props) {
  const [key, setKey] = useState(initialData?.key ?? "");
  const [definition, setDefinition] = useState(initialData?.definition ?? "");
  const [context, setContext] = useState(initialData?.context ?? "");
  const [preferred, setPreferred] = useState(initialData?.preferred ?? true);
  const [deprecated, setDeprecated] = useState(initialData?.deprecated ?? false);

  const [termEn, setTermEn] = useState(
    initialData?.translations.find((t) => t.locale_code === "en")?.term ?? "",
  );
  const [synonymsEn, setSynonymsEn] = useState(
    initialData?.translations.find((t) => t.locale_code === "en")?.synonyms.join(", ") ?? "",
  );

  const [termHi, setTermHi] = useState(
    initialData?.translations.find((t) => t.locale_code === "hi")?.term ?? "",
  );
  const [termChg, setTermChg] = useState(
    initialData?.translations.find((t) => t.locale_code === "chg")?.term ?? "",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError("Term key is required.");
      return;
    }

    const translations: GlossaryTranslation[] = [];
    if (termEn.trim()) {
      translations.push({
        locale_code: "en",
        term: termEn.trim(),
        synonyms: synonymsEn.split(",").map((s) => s.trim()).filter(Boolean),
      });
    }
    if (termHi.trim()) {
      translations.push({
        locale_code: "hi",
        term: termHi.trim(),
        synonyms: [],
      });
    }
    if (termChg.trim()) {
      translations.push({
        locale_code: "chg",
        term: termChg.trim(),
        synonyms: [],
      });
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        key: key.trim().toLowerCase().replace(/\s+/g, "_"),
        definition: definition.trim() || null,
        context: context.trim() || null,
        preferred,
        deprecated,
        translations,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save term.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <header className="mb-4">
          <h2 className="text-xl font-semibold text-slate-100">
            {initialData ? "Edit Glossary Term" : "Add Glossary Term"}
          </h2>
          <p className="text-sm text-slate-400">
            Define canonical Chhattisgarh tourism terminology across supported languages.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="glossary-key" className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Key Identifier (e.g. tourist_destination)
            </label>
            <input
              id="glossary-key"
              type="text"
              required
              disabled={Boolean(initialData)}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              placeholder="e.g. water_falls"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="glossary-term-en" className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                English Term
              </label>
              <input
                id="glossary-term-en"
                type="text"
                value={termEn}
                onChange={(e) => setTermEn(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                placeholder="Waterfall"
              />
            </div>
            <div>
              <label htmlFor="glossary-term-hi" className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Hindi (हिन्दी)
              </label>
              <input
                id="glossary-term-hi"
                type="text"
                value={termHi}
                onChange={(e) => setTermHi(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                placeholder="जलप्रपात"
              />
            </div>
            <div>
              <label htmlFor="glossary-term-chg" className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Chhattisgarhi (छत्तीसगढ़ी)
              </label>
              <input
                id="glossary-term-chg"
                type="text"
                value={termChg}
                onChange={(e) => setTermChg(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                placeholder="जलप्रपात / झरना"
              />
            </div>
          </div>

          <div>
            <label htmlFor="glossary-synonyms" className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Synonyms (comma-separated)
            </label>
            <input
              id="glossary-synonyms"
              type="text"
              value={synonymsEn}
              onChange={(e) => setSynonymsEn(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              placeholder="Falls, Cascade"
            />
          </div>

          <div>
            <label htmlFor="glossary-definition" className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Definition
            </label>
            <textarea
              id="glossary-definition"
              rows={2}
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              placeholder="Contextual definition for tourism content creators"
            />
          </div>

          <div className="flex items-center space-x-6 pt-2">
            <label className="flex items-center space-x-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={preferred}
                onChange={(e) => setPreferred(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500"
              />
              <span>Preferred Term</span>
            </label>

            <label className="flex items-center space-x-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={deprecated}
                onChange={(e) => setDeprecated(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-rose-500 focus:ring-rose-500"
              />
              <span className="text-rose-400">Deprecated / Forbidden</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-teal-400 disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Save Term"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
