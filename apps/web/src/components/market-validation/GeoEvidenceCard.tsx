import React from "react";

export interface GeoEvidenceItem {
  id?: string;
  task_id: string;
  source_place_id?: string | null;
  target_place_id?: string | null;
  relationship_type: string;
  expected_relationship?: string | null;
  observed_behavior: string;
  successful: boolean;
  difficulty: number; // 1 to 5
  confidence: number; // 0 to 1
  evidence_type: string;
  created_at?: string;
}

export interface GeoEvidenceCardProps {
  evidence: GeoEvidenceItem;
  onDelete?: (id: string) => void;
}

export function GeoEvidenceCard({ evidence, onDelete }: GeoEvidenceCardProps) {
  const confidencePercent = Math.round(evidence.confidence * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
            {evidence.task_id}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              evidence.successful
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {evidence.successful ? "Task Succeeded" : "Task Failed"}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500">Confidence:</span>
          <span className="font-bold text-slate-800">{confidencePercent}%</span>
        </div>
      </div>

      {/* Origin -> Target relationship tag */}
      <div className="flex items-center space-x-2 text-xs text-slate-600">
        <span className="font-bold text-slate-800">{evidence.source_place_id || "Anchor"}</span>
        <span className="text-slate-400">&rarr;</span>
        <span className="font-bold text-slate-800">{evidence.target_place_id || "Adjacent"}</span>
        <span className="text-slate-400">|</span>
        <span className="font-mono text-indigo-600 font-semibold">{evidence.relationship_type}</span>
      </div>

      <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100">
        {evidence.observed_behavior}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
        <div className="flex items-center space-x-3 text-slate-500">
          <span>
            Difficulty:{" "}
            <span className="font-bold text-slate-800">{evidence.difficulty}/5</span>
          </span>
          <span>&bull;</span>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
            {evidence.evidence_type}
          </span>
        </div>

        {onDelete && evidence.id && (
          <button
            type="button"
            onClick={() => onDelete(evidence.id!)}
            className="text-red-500 hover:text-red-700 text-xs transition-colors"
          >
            Delete Observation
          </button>
        )}
      </div>
    </div>
  );
}
