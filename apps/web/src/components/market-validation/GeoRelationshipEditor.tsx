import React, { useState } from "react";

export interface GeoRelationshipData {
  id?: string;
  source_destination_id: string;
  target_destination_id: string;
  relationship_type: string;
  straight_line_km?: number | null;
  road_distance_km?: number | null;
  estimated_travel_minutes?: number | null;
  validation_status: "VALIDATED" | "PROVISIONAL" | "INVALIDATED" | "DISPUTED";
  confidence: number;
  evidence_type: string;
}

export const VALID_RELATIONSHIPS = [
  { value: "NEARBY", label: "Nearby (<50km)" },
  { value: "WITHIN_ZONE", label: "Within Zone" },
  { value: "CONNECTED_BY_ROUTE", label: "Connected By Route" },
  { value: "ALONG_ROUTE", label: "Along Route / Waypoint" },
  { value: "NEXT_DESTINATION", label: "Next Logical Destination" },
  { value: "ALTERNATIVE_DESTINATION", label: "Alternative Destination" },
  { value: "COMPLEMENTARY_DESTINATION", label: "Complementary Destination" },
  { value: "SAME_EXPERIENCE_CLUSTER", label: "Same Experience Cluster" },
  { value: "SAME_TRIP_CLUSTER", label: "Same Trip Cluster" },
  { value: "ACCESSIBLE_FROM", label: "Accessible From Gateway" },
];

export interface GeoRelationshipEditorProps {
  initialData?: Partial<GeoRelationshipData>;
  onSave?: (data: GeoRelationshipData) => void;
  onCancel?: () => void;
  destinations?: { id: string; name: string }[];
}

export function GeoRelationshipEditor({
  initialData,
  onSave,
  onCancel,
  destinations = [
    { id: "DEST_JAGDALPUR", name: "Jagdalpur" },
    { id: "DEST_CHITRAKOTE", name: "Chitrakote Falls" },
    { id: "DEST_TIRATHGARH", name: "Tirathgarh Falls" },
    { id: "DEST_KANGER_CAVE", name: "Kotumsar Cave" },
    { id: "DEST_DANTEWADA", name: "Dantewada" },
  ],
}: GeoRelationshipEditorProps) {
  const [sourceId, setSourceId] = useState(initialData?.source_destination_id || "DEST_JAGDALPUR");
  const [targetId, setTargetId] = useState(initialData?.target_destination_id || "DEST_CHITRAKOTE");
  const [relType, setRelType] = useState(initialData?.relationship_type || "NEARBY");
  const [status, setStatus] = useState<GeoRelationshipData["validation_status"]>(
    initialData?.validation_status || "PROVISIONAL"
  );
  const [roadKm, setRoadKm] = useState<number | "">(initialData?.road_distance_km ?? 38.5);
  const [travelMins, setTravelMins] = useState<number | "">(initialData?.estimated_travel_minutes ?? 55);
  const [confidence, setConfidence] = useState<number>(initialData?.confidence ?? 0.85);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceId === targetId) {
      alert("Source and target destinations cannot be identical.");
      return;
    }
    if (onSave) {
      onSave({
        id: initialData?.id,
        source_destination_id: sourceId,
        target_destination_id: targetId,
        relationship_type: relType,
        road_distance_km: roadKm === "" ? undefined : Number(roadKm),
        estimated_travel_minutes: travelMins === "" ? undefined : Number(travelMins),
        validation_status: status,
        confidence,
        evidence_type: "GEOSPATIAL_CALCULATION",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900">
          {initialData?.id ? "Edit Geographic Relationship" : "Establish Geographic Relationship"}
        </h3>
        <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-blue-50 text-blue-700">
          MV4 Geo Connect
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Source Destination</label>
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Target Destination</label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship Type</label>
          <select
            value={relType}
            onChange={(e) => setRelType(e.target.value)}
            className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {VALID_RELATIONSHIPS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Validation Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as GeoRelationshipData["validation_status"])}
            className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="PROVISIONAL">PROVISIONAL</option>
            <option value="VALIDATED">VALIDATED</option>
            <option value="DISPUTED">DISPUTED</option>
            <option value="INVALIDATED">INVALIDATED</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Road Distance (km)</label>
          <input
            type="number"
            step="0.1"
            value={roadKm}
            onChange={(e) => setRoadKm(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. 38.5"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Travel Time (mins)</label>
          <input
            type="number"
            value={travelMins}
            onChange={(e) => setTravelMins(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. 55"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Confidence Score: {confidence.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="w-full mt-2 accent-emerald-600"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm transition-colors"
        >
          Save Relationship
        </button>
      </div>
    </form>
  );
}
