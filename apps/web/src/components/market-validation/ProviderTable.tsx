import React from "react";

export interface ProviderItem {
  id: string;
  business_name: string;
  provider_type: string;
  segment: string;
  geography: string;
  operating_area: string;
  verification_status: string;
  digital_presence: string;
  willingness_to_participate: boolean;
  willingness_to_pay: string;
  created_at: string;
}

export interface ProviderTableProps {
  providers: ProviderItem[];
  onSelectProvider?: (provider: ProviderItem) => void;
  onStartOnboarding?: (providerId: string) => void;
}

export function ProviderTable({
  providers,
  onSelectProvider,
  onStartOnboarding,
}: ProviderTableProps) {
  return (
    <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Business / Provider
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Type & Segment
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Geography & Area
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Digital Maturity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Verification Status
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {providers.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                No providers found. Register providers to begin supply-side validation.
              </td>
            </tr>
          ) : (
            providers.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">{p.business_name}</div>
                  <div className="text-xs text-slate-400">ID: {p.id.substring(0, 8)}...</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded mr-1">
                    {p.provider_type}
                  </span>
                  <div className="text-xs text-slate-500 mt-0.5">{p.segment}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-800">{p.geography}</div>
                  <div className="text-xs text-slate-500">{p.operating_area}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                    {p.digital_presence}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                      p.verification_status === "VERIFIED"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-amber-100 text-amber-800 border-amber-200"
                    }`}
                  >
                    {p.verification_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                  {onSelectProvider && (
                    <button
                      onClick={() => onSelectProvider(p)}
                      className="text-emerald-600 hover:text-emerald-900 mr-3"
                    >
                      View Details
                    </button>
                  )}
                  {onStartOnboarding && p.verification_status !== "VERIFIED" && (
                    <button
                      onClick={() => onStartOnboarding(p.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Onboard
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
