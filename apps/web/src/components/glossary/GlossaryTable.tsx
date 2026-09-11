"use client";

import React, { useState } from "react";
import type { GlossaryTerm } from "@/types/glossary";
import { GlossaryStatusBadge } from "./GlossaryStatusBadge";

interface Props {
  terms: GlossaryTerm[];
  onEdit: (term: GlossaryTerm) => void;
  onDelete: (id: number) => void;
}

export function GlossaryTable({ terms, onEdit, onDelete }: Props) {
  const [filter, setFilter] = useState("");

  const filtered = terms.filter((term) => {
    const q = filter.toLowerCase();
    return (
      term.key.toLowerCase().includes(q) ||
      term.translations.some((t) => t.term.toLowerCase().includes(q)) ||
      (term.definition && term.definition.toLowerCase().includes(q))
    );
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter terms by key, translation, or definition…"
          className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
        />
        <div className="text-xs text-slate-400">
          Showing {filtered.length} of {terms.length} terms
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
        <div className="grid grid-cols-12 gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-3 text-xs font-semibold uppercase text-slate-400">
          <span className="col-span-3">Key & Definition</span>
          <span className="col-span-2">English</span>
          <span className="col-span-2">Hindi</span>
          <span className="col-span-2">Chhattisgarhi</span>
          <span className="col-span-1">Status</span>
          <span className="col-span-2 text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No glossary terms found matching your query.
          </div>
        ) : (
          filtered.map((item) => {
            const en = item.translations.find((t) => t.locale_code === "en");
            const hi = item.translations.find((t) => t.locale_code === "hi");
            const chg = item.translations.find((t) => t.locale_code === "chg");

            return (
              <div
                key={item.id}
                className="grid grid-cols-12 items-center gap-3 border-b border-slate-800/60 px-4 py-3 text-sm hover:bg-slate-800/30 transition-colors"
              >
                <div className="col-span-3">
                  <div className="font-mono font-medium text-teal-400">{item.key}</div>
                  {item.definition && (
                    <div className="text-xs text-slate-400 line-clamp-1">{item.definition}</div>
                  )}
                </div>

                <div className="col-span-2">
                  <span className="text-slate-200">{en?.term ?? "—"}</span>
                  {en?.synonyms && en.synonyms.length > 0 && (
                    <span className="block text-xs text-slate-500">
                      syn: {en.synonyms.join(", ")}
                    </span>
                  )}
                </div>

                <div className="col-span-2 text-slate-300">{hi?.term ?? "—"}</div>

                <div className="col-span-2 text-slate-300">{chg?.term ?? "—"}</div>

                <div className="col-span-1">
                  <GlossaryStatusBadge
                    preferred={item.preferred}
                    deprecated={item.deprecated}
                  />
                </div>

                <div className="col-span-2 flex justify-end space-x-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-teal-400 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
