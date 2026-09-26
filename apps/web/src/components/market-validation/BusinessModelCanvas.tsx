import React from "react";

export interface CanvasItem {
  title: string;
  description: string;
  evidence: string;
  status: string;
}

export interface HypothesisItem {
  id: string;
  statement: string;
  target_side: string;
  status: string;
  observation: string;
  confidence: number;
}

export interface BusinessModelCanvasProps {
  customerSegments?: CanvasItem[];
  valuePropositions?: CanvasItem[];
  channels?: CanvasItem[];
  customerRelationships?: CanvasItem[];
  revenueStreams?: CanvasItem[];
  keyResources?: CanvasItem[];
  keyActivities?: CanvasItem[];
  keyPartners?: CanvasItem[];
  costStructure?: CanvasItem[];
  hypotheses?: HypothesisItem[];
}

const DEFAULT_SEGMENTS: CanvasItem[] = [
  {
    title: "Rural & Tribal Homestays",
    description: "Micro-hospitality hosts in Bastar & Surguja needing direct customer acquisition",
    evidence: "MV3: 74% lack formal OTA reach",
    status: "VALIDATED",
  },
  {
    title: "Experiential Travelers",
    description: "Culture explorers seeking verified safety, authentic guides, and structured routes",
    evidence: "MV2 & MV5: 24.5% conversion to itinerary",
    status: "VALIDATED",
  },
];

const DEFAULT_VALUE_PROPS: CanvasItem[] = [
  {
    title: "Qualified Traveler Demand Dispatch",
    description: "Verified inquiries with travel dates and headcount directly to host WhatsApp",
    evidence: "MV7: 70% qualification rate, 4.2x faster SLA",
    status: "VALIDATED",
  },
  {
    title: "Zero-Cost Regional Discovery",
    description: "Open GIS destination mapping, travel advisories, and cultural context",
    evidence: "MV5: 4.45x lift over unstructured prose",
    status: "VALIDATED",
  },
];

const DEFAULT_REVENUE: CanvasItem[] = [
  {
    title: "Pay-Per-Qualified-Lead (₹25/lead)",
    description: "Provider pays only for verified traveler inquiries delivered",
    evidence: "H-MV9-001: 74% willingness to pay",
    status: "PRIORITY_STREAM",
  },
  {
    title: "Provider Pro Tier (₹499/mo)",
    description: "Inquiry CRM, demand analytics, verified host badge",
    evidence: "H-MV9-002: 88% preference for performance tools",
    status: "SECONDARY_STREAM",
  },
];

const DEFAULT_COSTS: CanvasItem[] = [
  {
    title: "Field Researcher Verification",
    description: "On-ground audit and operator interview stipends",
    evidence: "Fixed survey & verification operations",
    status: "CONTROLLED",
  },
  {
    title: "SMS & WhatsApp Dispatch APIs",
    description: "Real-time inquiry routing costs (₹0.15/msg)",
    evidence: "Direct variable transaction cost",
    status: "MINIMAL",
  },
];

export function BusinessModelCanvas({
  customerSegments = DEFAULT_SEGMENTS,
  valuePropositions = DEFAULT_VALUE_PROPS,
  revenueStreams = DEFAULT_REVENUE,
  costStructure = DEFAULT_COSTS,
  hypotheses = [],
}: BusinessModelCanvasProps) {
  return (
    <div className="space-y-6" data-testid="business-model-canvas">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">CG Tourism OS — Business Model Canvas</h3>
            <p className="text-xs text-slate-500">
              Validated economic architecture connecting demand generation, supply monetization, and public trust
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Model: HYBRID_PROVIDER_FIRST
          </span>
        </div>

        {/* 4-Column Grid for Canvas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Customer Segments */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Customer Segments</h4>
            <div className="space-y-2">
              {customerSegments.map((item, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded border border-slate-200 text-xs">
                  <div className="font-semibold text-slate-800">{item.title}</div>
                  <div className="text-slate-500 mt-1">{item.description}</div>
                  <div className="text-emerald-600 font-medium mt-1 text-[11px]">{item.evidence}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Value Propositions */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">Value Propositions</h4>
            <div className="space-y-2">
              {valuePropositions.map((item, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded border border-emerald-100 text-xs">
                  <div className="font-semibold text-slate-800">{item.title}</div>
                  <div className="text-slate-500 mt-1">{item.description}</div>
                  <div className="text-emerald-700 font-medium mt-1 text-[11px]">{item.evidence}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Streams */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-2">Revenue Streams</h4>
            <div className="space-y-2">
              {revenueStreams.map((item, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded border border-blue-100 text-xs">
                  <div className="font-semibold text-slate-800">{item.title}</div>
                  <div className="text-slate-500 mt-1">{item.description}</div>
                  <div className="text-blue-700 font-medium mt-1 text-[11px]">{item.evidence}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Structure */}
          <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">Cost Structure</h4>
            <div className="space-y-2">
              {costStructure.map((item, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded border border-amber-100 text-xs">
                  <div className="font-semibold text-slate-800">{item.title}</div>
                  <div className="text-slate-500 mt-1">{item.description}</div>
                  <div className="text-amber-700 font-medium mt-1 text-[11px]">{item.evidence}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hypotheses Matrix */}
        {hypotheses.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Monetization Hypotheses Verification ({hypotheses.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {hypotheses.map((h) => (
                <div key={h.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-800">{h.id}: {h.statement}</div>
                    <div className="text-slate-500 mt-0.5">{h.observation}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0 ml-2">
                    {Math.round(h.confidence * 100)}% Conf
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
