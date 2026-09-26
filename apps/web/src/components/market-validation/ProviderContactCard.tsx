import React from "react";

export interface ProviderContactCardProps {
  providerId: string;
  businessName: string;
  providerType: string;
  geography: string;
  operatingArea?: string;
  responseTimeRating?: string;
  averageResponseMinutes?: number;
  contactChannels?: string[];
  isVerified?: boolean;
  onInitiateContact?: (channel: string) => void;
  onRequestBooking?: () => void;
}

export function ProviderContactCard({
  providerId,
  businessName,
  providerType,
  geography,
  operatingArea,
  responseTimeRating = "Typically responds in under 1 hour",
  averageResponseMinutes = 45,
  contactChannels = ["WHATSAPP", "PHONE"],
  isVerified = true,
  onInitiateContact,
  onRequestBooking,
}: ProviderContactCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 text-lg">{businessName}</h3>
            {isVerified && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                Verified Provider
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            {providerType} • {operatingArea ? `${operatingArea}, ` : ""}{geography}
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200">
          ID: {providerId.slice(0, 8)}
        </span>
      </div>

      <div className="bg-slate-50 rounded-lg p-3 mb-4 text-xs text-slate-600 flex items-center justify-between">
        <div>
          <span className="font-medium text-slate-800">Response SLA: </span>
          <span>{responseTimeRating}</span>
        </div>
        {averageResponseMinutes && (
          <span className="font-mono text-slate-500">~{averageResponseMinutes}m avg</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
        {contactChannels.includes("WHATSAPP") && (
          <button
            type="button"
            onClick={() => onInitiateContact?.("WHATSAPP")}
            className="flex-1 min-w-[120px] px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 text-center"
          >
            Chat on WhatsApp
          </button>
        )}
        {contactChannels.includes("PHONE") && (
          <button
            type="button"
            onClick={() => onInitiateContact?.("PHONE")}
            className="flex-1 min-w-[100px] px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
          >
            Call Provider
          </button>
        )}
        <button
          type="button"
          onClick={onRequestBooking}
          className="w-full mt-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm text-center"
        >
          Book Assisted Inquiry
        </button>
      </div>
    </div>
  );
}
