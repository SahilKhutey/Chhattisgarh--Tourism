"use client";

import React, { useState } from "react";
import { updateContentFieldTranslation } from "@/lib/api/localization";

interface Props {
  entryId: string;
  fieldKey: string;
  fieldLabel: string;
  translatable: boolean;
  localeCode: string;
  originalValue: string;
  initialTranslation?: string;
  onSaved?: () => void;
}

export function TranslationEditor({
  entryId,
  fieldKey,
  fieldLabel,
  translatable,
  localeCode,
  originalValue,
  initialTranslation = "",
  onSaved,
}: Props) {
  const [value, setValue] = useState(initialTranslation);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!translatable) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3 text-xs text-slate-500 flex items-center justify-between">
        <span>{fieldLabel} ({fieldKey})</span>
        <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-400">Non-Translatable</span>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await updateContentFieldTranslation(entryId, fieldKey, {
        locale_code: localeCode,
        field_key: fieldKey,
        value: value.trim() || null,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      onSaved?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Translation save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label
            htmlFor={`trans-${fieldKey}`}
            className="text-xs font-semibold uppercase tracking-wider text-slate-300"
          >
            {fieldLabel}
          </label>
          <span className="ml-2 font-mono text-[11px] text-slate-500">{fieldKey}</span>
        </div>
        <span className="text-xs font-mono uppercase text-teal-400 font-medium">
          {localeCode}
        </span>
      </div>

      {originalValue && (
        <div className="rounded-lg bg-slate-950/60 p-2.5 text-xs text-slate-400 border border-slate-800/80">
          <span className="font-semibold text-slate-300">English Reference: </span>
          {originalValue}
        </div>
      )}

      {error && (
        <div role="alert" className="rounded p-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20">
          {error}
        </div>
      )}

      <div>
        <textarea
          id={`trans-${fieldKey}`}
          rows={3}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Enter ${localeCode.toUpperCase()} translation…`}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        {savedSuccess ? (
          <span role="status" className="text-xs text-emerald-400 font-medium">
            ✓ Translation saved
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-teal-400 disabled:opacity-50 transition-colors"
        >
          {isSaving ? "Saving…" : "Save Translation"}
        </button>
      </div>
    </div>
  );
}
