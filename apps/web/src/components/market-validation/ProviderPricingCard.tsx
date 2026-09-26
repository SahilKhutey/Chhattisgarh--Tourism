import React from "react";

export interface PricingTierItem {
  name: string;
  price: number;
  currency: string;
  unit: string;
  description: string;
  features: string[];
  is_recommended?: boolean;
}

export interface ProviderPricingCardProps {
  tiers?: PricingTierItem[];
}

const DEFAULT_TIERS: PricingTierItem[] = [
  {
    name: "Standard Inquiry",
    price: 10.0,
    currency: "INR",
    unit: "per inquiry",
    description: "Introductory inquiry for general destination and route information.",
    features: ["Basic contact details", "Estimated travel dates", "Group size"],
    is_recommended: false,
  },
  {
    name: "Verified Traveler Lead",
    price: 25.0,
    currency: "INR",
    unit: "per verified lead",
    description: "High intent, phone & OTP authenticated traveler with validated budget.",
    features: [
      "Phone & OTP verified",
      "Exact dates & budget",
      "WhatsApp 1-click connect",
      "Max 2 competing hosts",
    ],
    is_recommended: true,
  },
  {
    name: "Pro Operator Subscription",
    price: 499.0,
    currency: "INR",
    unit: "per month",
    description: "Full operating suite for established eco-resorts and adventure organizers.",
    features: [
      "Inquiry CRM & fast response",
      "Verified Operator Badge",
      "Demand Analytics & Seasonality",
      "Priority dispatch routing",
    ],
    is_recommended: false,
  },
];

export function ProviderPricingCard({ tiers = DEFAULT_TIERS }: ProviderPricingCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" data-testid="provider-pricing-card">
      <div className="border-b border-slate-100 pb-3 mb-4">
        <h3 className="font-semibold text-slate-900 text-sm">Provider Monetization Tiers</h3>
        <p className="text-xs text-slate-500">
          Tailored for rural homestays, licensed guides, and community eco-camps across Bastar & Surguja
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border flex flex-col justify-between ${
              tier.is_recommended
                ? "border-emerald-400 bg-emerald-50/30 ring-2 ring-emerald-400/20"
                : "border-slate-200 bg-white"
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-800">{tier.name}</span>
                {tier.is_recommended && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                    RECOMMENDED
                  </span>
                )}
              </div>
              <div className="my-2">
                <span className="text-2xl font-black text-slate-900">
                  {`${tier.currency === "INR" ? "₹" : ""}${tier.price.toFixed(0)}`}
                </span>
                <span className="text-xs text-slate-500 ml-1">/ {tier.unit}</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">{tier.description}</p>
              <ul className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-700">
                {tier.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <span className="text-[11px] font-medium text-slate-500">
                Performance-aligned • Zero listing barriers
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
