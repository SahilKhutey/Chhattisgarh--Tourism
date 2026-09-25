import React from "react";
import { LeadStatus } from "./LeadStatus";

export interface LeadItem {
  id: string;
  provider_id: string;
  source: string;
  traveler_segment: string;
  destination: string;
  experience: string;
  request_type: string;
  status: string;
  qualified: boolean;
  conversion_status: string;
  response_time_seconds?: number;
  created_at: string;
}

export interface LeadTableProps {
  leads: LeadItem[];
  onQualify?: (leadId: string) => void;
  onRecordResponse?: (leadId: string) => void;
  onRecordBooking?: (leadId: string) => void;
}

export function LeadTable({
  leads,
  onQualify,
  onRecordResponse,
  onRecordBooking,
}: LeadTableProps) {
  const formatTime = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return "—";
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  return (
    <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Experience / Destination
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Traveler Segment & Source
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Request Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Response Time
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {leads.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                No tourism leads recorded yet.
              </td>
            </tr>
          ) : (
            leads.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-slate-900">{l.experience}</div>
                  <div className="text-xs text-slate-500">{l.destination}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-800">{l.traveler_segment}</div>
                  <div className="text-xs text-slate-400">Source: {l.source}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded font-medium">
                    {l.request_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <LeadStatus status={l.status} qualified={l.qualified} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                  {formatTime(l.response_time_seconds)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-2">
                  {!l.qualified && onQualify && (
                    <button
                      onClick={() => onQualify(l.id)}
                      className="text-amber-600 hover:text-amber-800"
                    >
                      Qualify
                    </button>
                  )}
                  {l.status !== "RESPONDED" && l.status !== "BOOKED" && onRecordResponse && (
                    <button
                      onClick={() => onRecordResponse(l.id)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Response
                    </button>
                  )}
                  {l.status !== "BOOKED" && onRecordBooking && (
                    <button
                      onClick={() => onRecordBooking(l.id)}
                      className="text-emerald-600 hover:text-emerald-800"
                    >
                      Booked
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
