"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGlossaryTerm,
  deleteGlossaryTerm,
  getGlossary,
  updateGlossaryTerm,
} from "@/lib/api/glossary";
import type { GlossaryTerm } from "@/types/glossary";
import { GlossaryTable } from "@/components/glossary/GlossaryTable";
import { GlossaryEditor } from "@/components/glossary/GlossaryEditor";

export default function GlossaryPage() {
  const queryClient = useQueryClient();
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "glossary"],
    queryFn: getGlossary,
  });

  const createMutation = useMutation({
    mutationFn: createGlossaryTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "glossary"] });
      setIsAdding(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<Omit<GlossaryTerm, "id">>;
    }) => updateGlossaryTerm(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "glossary"] });
      setEditingTerm(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGlossaryTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "glossary"] });
    },
  });

  const handleSave = async (payload: Omit<GlossaryTerm, "id">) => {
    if (editingTerm) {
      await updateMutation.mutateAsync({
        id: editingTerm.id,
        payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this glossary term?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Glossary</h1>
          <p className="text-sm text-slate-400">
            Manage canonical tourism terminology.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-400 transition-colors shadow-sm"
        >
          + Add Glossary Term
        </button>
      </header>

      {isLoading ? (
        <div className="flex items-center space-x-3 text-sm text-slate-400">
          <div className="h-4 w-4 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
          <span>Loading glossary…</span>
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400"
        >
          {error instanceof Error ? error.message : "Unable to load glossary."}
        </div>
      ) : (
        <>
          <GlossaryTable
            terms={data ?? []}
            onEdit={(term) => setEditingTerm(term)}
            onDelete={handleDelete}
          />

          {(isAdding || editingTerm) && (
            <GlossaryEditor
              initialData={editingTerm}
              onSave={handleSave}
              onCancel={() => {
                setIsAdding(false);
                setEditingTerm(null);
              }}
            />
          )}
        </>
      )}
    </main>
  );
}
