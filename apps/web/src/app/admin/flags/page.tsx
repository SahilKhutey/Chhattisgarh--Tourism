"use client";

import { useEffect, useState } from "react";
import { fetchAtisFlags, SystemFlag } from "../../data/api";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function SystemFlagsPage() {
  const [flags, setFlags] = useState<SystemFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAtisFlags().then(data => {
      setFlags(data);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-medium text-white tracking-tight">System Flags Resolution</h1>
          <p className="text-slate-400 text-sm">Review issues raised by the Health & Media Understanding Engines.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-teal-500 animate-pulse">Scanning knowledge graph for flags...</div>
      ) : flags.length === 0 ? (
        <div className="p-12 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-700 mb-4" />
          <h3 className="text-lg font-medium text-slate-300">All Systems Nominal</h3>
          <p className="text-slate-500 text-sm mt-1">No active system flags found.</p>
        </div>
      ) : (
        <div className="bg-[#0a0f18] border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Issue ID</th>
                <th className="px-6 py-4 font-medium">Flag Type</th>
                <th className="px-6 py-4 font-medium">Target</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Confidence</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {flags.map(flag => (
                <tr key={flag.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{flag.id.split('-')[0]}</td>
                  <td className="px-6 py-4">
                    <span className="bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-md border border-rose-500/20 font-medium text-xs">
                      {flag.flagType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-200">
                    {flag.place ? flag.place.name : flag.media ? 'Media Asset' : 'Unknown'}
                  </td>
                  <td className="px-6 py-4 truncate max-w-xs" title={flag.description}>{flag.description}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full mr-2 overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${flag.aiConfidence * 100}%` }}></div>
                      </div>
                      <span className="text-xs">{Math.round(flag.aiConfidence * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-teal-400 hover:text-teal-300 font-medium">Resolve</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
