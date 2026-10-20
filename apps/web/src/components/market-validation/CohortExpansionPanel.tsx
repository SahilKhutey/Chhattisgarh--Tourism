import React, { useState } from "react";
import {
  TrendingUp,
  Users,
  IndianRupee,
  Clock,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Target,
  Share2,
} from "lucide-react";

export interface FeederCohortItem {
  id: string;
  name: string;
  origin_market: string;
  traveler_segment: string;
  qualified_leads: int_or_number;
  avg_party_size: number;
  conversion_to_booking_pct: number;
  avg_response_sla_hours: number;
  sla_compliance_pct: number;
  primary_destinations: string[];
  popular_experiences: string[];
  referral_intent_pct: number;
}

type int_or_number = number;

export interface MonetizationEconomics {
  pricing_model: string;
  fee_per_lead_inr: number;
  total_qualified_leads: number;
  gross_revenue_inr: number;
  dispatch_cost_per_lead_inr: number;
  total_dispatch_cost_inr: number;
  net_gross_profit_inr: number;
  net_contribution_margin_pct: number;
  host_collection_rate_pct: number;
  provider_satisfaction_pct: number;
  blended_ltv_cac_ratio: number;
  payback_period_days: number;
}

export interface HostSlaMetrics {
  target_sla_hours: number;
  observed_avg_sla_hours: number;
  total_leads_dispatched: number;
  within_sla_count: number;
  sla_compliance_pct: number;
  breached_count: number;
  auto_reassigned_count: number;
  fastest_response_minutes: number;
  slowest_response_hours: number;
}

export interface RetentionReferralMetrics {
  total_travelers_surveyed: number;
  repeat_trip_planning_intent_pct: number;
  gate_8_threshold_pct: number;
  gate_8_passed: boolean;
  net_promoter_score: number;
  word_of_mouth_referral_pct: number;
  secondary_circuit_interest_pct: number;
  preferred_secondary_circuit: string;
}

export interface CohortExpansionData {
  pilot_id: string;
  phase: string;
  status: string;
  total_leads_target: number;
  total_leads_achieved: number;
  feeder_cohorts: FeederCohortItem[];
  monetization: MonetizationEconomics;
  host_sla: HostSlaMetrics;
  retention_referral: RetentionReferralMetrics;
}

export interface CohortExpansionPanelProps {
  data?: CohortExpansionData | null;
  loading?: boolean;
}

const DEFAULT_COHORT_DATA: CohortExpansionData = {
  pilot_id: "pilot-bastar-circuit-1",
  phase: "Phase 2: Days 31–60 Cohort Expansion & Monetization Validation",
  status: "VALIDATED",
  total_leads_target: 150,
  total_leads_achieved: 160,
  feeder_cohorts: [
    {
      id: "cohort-raipur-weekend",
      name: "Raipur Urban Experiential Explorers",
      origin_market: "Raipur (290 km, 5.5h drive via NH30)",
      traveler_segment: "Weekend Escapes & Young Professionals",
      qualified_leads: 65,
      avg_party_size: 3.2,
      conversion_to_booking_pct: 38.5,
      avg_response_sla_hours: 1.8,
      sla_compliance_pct: 95.4,
      primary_destinations: ["Chitrakote Falls", "Tirathgarh Falls"],
      popular_experiences: ["Waterfall rim sunset trek", "Tribal Gondi cooking"],
      referral_intent_pct: 44.6,
    },
    {
      id: "cohort-nagpur-nature",
      name: "Nagpur Wildlife & Cultural Enthusiasts",
      origin_market: "Nagpur (460 km, direct rail/road connection)",
      traveler_segment: "Eco-Conscious Nature Seekers",
      qualified_leads: 50,
      avg_party_size: 2.8,
      conversion_to_booking_pct: 36.0,
      avg_response_sla_hours: 2.0,
      sla_compliance_pct: 94.0,
      primary_destinations: ["Kotumsar Caves & Kanger Valley", "Chitrakote Falls"],
      popular_experiences: ["Subterranean caving", "Forest wildlife birding trail"],
      referral_intent_pct: 42.0,
    },
    {
      id: "cohort-hyderabad-heritage",
      name: "Hyderabad Heritage & Adventure Pilgrims",
      origin_market: "Hyderabad (560 km, flight to Jagdalpur / road via Sukma)",
      traveler_segment: "Heritage & Trekking Travelers",
      qualified_leads: 45,
      avg_party_size: 2.5,
      conversion_to_booking_pct: 40.0,
      avg_response_sla_hours: 1.9,
      sla_compliance_pct: 93.3,
      primary_destinations: ["Dholkal Ganesh Peak", "Kanger Valley"],
      popular_experiences: ["3000ft granite peak hike", "Dhokra metalcraft workshops"],
      referral_intent_pct: 40.0,
    },
  ],
  monetization: {
    pricing_model: "PAY_PER_QUALIFIED_LEAD_INR_25",
    fee_per_lead_inr: 25.0,
    total_qualified_leads: 160,
    gross_revenue_inr: 4000.0,
    dispatch_cost_per_lead_inr: 0.35,
    total_dispatch_cost_inr: 56.0,
    net_gross_profit_inr: 3944.0,
    net_contribution_margin_pct: 98.6,
    host_collection_rate_pct: 96.2,
    provider_satisfaction_pct: 91.5,
    blended_ltv_cac_ratio: 4.8,
    payback_period_days: 18.2,
  },
  host_sla: {
    target_sla_hours: 4.0,
    observed_avg_sla_hours: 1.9,
    total_leads_dispatched: 160,
    within_sla_count: 151,
    sla_compliance_pct: 94.4,
    breached_count: 9,
    auto_reassigned_count: 9,
    fastest_response_minutes: 18,
    slowest_response_hours: 5.2,
  },
  retention_referral: {
    total_travelers_surveyed: 120,
    repeat_trip_planning_intent_pct: 42.5,
    gate_8_threshold_pct: 40.0,
    gate_8_passed: true,
    net_promoter_score: 64,
    word_of_mouth_referral_pct: 37.5,
    secondary_circuit_interest_pct: 68.5,
    preferred_secondary_circuit: "Surguja Ecotourism Circuit (Mainpat & Ramgarh Caves)",
  },
};

export function CohortExpansionPanel({ data, loading = false }: CohortExpansionPanelProps) {
  const current = data || DEFAULT_COHORT_DATA;
  const [selectedCohortId, setSelectedCohortId] = useState<string>("ALL");

  const filteredCohorts =
    selectedCohortId === "ALL"
      ? current.feeder_cohorts
      : current.feeder_cohorts.filter((c) => c.id === selectedCohortId);

  const leadsAttainmentPct = Math.min(
    100,
    Math.round((current.total_leads_achieved / current.total_leads_target) * 100)
  );

  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6"
      data-testid="cohort-expansion-panel"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
              Phase 2 Validation • Days 31–60
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Status: {current.status}
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" /> Feeder Market Cohorts &amp; ₹25 Pay-Per-Lead Economics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Validation across feeder hubs (Raipur, Nagpur, Hyderabad). Monitoring 150+ lead milestone, provider response SLA (&lt; 4h), unit economics, and traveler repeat intent.
          </p>
        </div>

        {/* Lead Target Gauge */}
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200/60 self-start md:self-auto">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
              Qualified Leads Milestone
            </div>
            <div className="text-xl font-bold text-indigo-600">
              {current.total_leads_achieved}{" "}
              <span className="text-xs font-normal text-slate-500">/ {current.total_leads_target} target</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 flex items-center justify-center font-bold text-xs text-indigo-700">
            {leadsAttainmentPct}%
          </div>
        </div>
      </div>

      {/* Top Metric Cards: 4 Key Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Feeder Cohort Volume */}
        <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40">
          <div className="flex items-center justify-between text-indigo-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Feeder Volume</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {current.total_leads_achieved}{" "}
            <span className="text-xs font-semibold text-emerald-600">Leads (106.7%)</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Raipur (65) • Nagpur (50) • Hyd (45)
          </p>
        </div>

        {/* Metric 2: Pay-Per-Lead Unit Economics */}
        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">₹25 Model Margin</span>
            <IndianRupee className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {current.monetization.net_contribution_margin_pct}%
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            ₹{current.monetization.gross_revenue_inr.toLocaleString()} rev • ₹{current.monetization.total_dispatch_cost_inr} SMS cost
          </p>
        </div>

        {/* Metric 3: Host Response SLA */}
        <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/40">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Host Response SLA</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {current.host_sla.observed_avg_sla_hours} hrs{" "}
            <span className="text-xs font-semibold text-emerald-600">
              ({current.host_sla.sla_compliance_pct}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Target &lt; {current.host_sla.target_sla_hours}h • {current.host_sla.auto_reassigned_count} auto-reassigned
          </p>
        </div>

        {/* Metric 4: Gate 8 Repeat Intent */}
        <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/40">
          <div className="flex items-center justify-between text-purple-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Gate 8 Repeat Intent</span>
            <Target className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {current.retention_referral.repeat_trip_planning_intent_pct}%{" "}
            <span className="text-xs font-semibold text-emerald-600">PASSED</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Threshold $\ge$ {current.retention_referral.gate_8_threshold_pct}% • NPS +{current.retention_referral.net_promoter_score}
          </p>
        </div>
      </div>

      {/* Cohorts Breakdown Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-500" /> Feeder Market Cohort Performance
          </h3>
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setSelectedCohortId("ALL")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedCohortId === "ALL"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Feeder Markets ({current.feeder_cohorts.length})
            </button>
            {current.feeder_cohorts.map((cohort) => (
              <button
                key={cohort.id}
                onClick={() => setSelectedCohortId(cohort.id)}
                className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  selectedCohortId === cohort.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cohort.name.split(" ")[0]} ({cohort.qualified_leads})
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Feeder Cohort</th>
                <th className="py-2.5 px-3">Traveler Segment</th>
                <th className="py-2.5 px-3 text-center">Qualified Leads</th>
                <th className="py-2.5 px-3 text-center">Party Size</th>
                <th className="py-2.5 px-3 text-center">Booking Conv.</th>
                <th className="py-2.5 px-3 text-center">Host SLA</th>
                <th className="py-2.5 px-3">Top Experiences Booked</th>
                <th className="py-2.5 px-3 text-right">Referral Intent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCohorts.map((cohort) => (
                <tr key={cohort.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{cohort.name}</div>
                    <div className="text-[10px] text-slate-500">{cohort.origin_market}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px]">
                      {cohort.traveler_segment}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">
                    {cohort.qualified_leads}
                  </td>
                  <td className="py-3 px-3 text-center">{cohort.avg_party_size} pax</td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-semibold text-emerald-600">
                      {cohort.conversion_to_booking_pct}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="font-medium text-slate-800">{cohort.avg_response_sla_hours}h avg</div>
                    <div className="text-[10px] text-emerald-600">{cohort.sla_compliance_pct}% on-time</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {cohort.popular_experiences.map((exp, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-indigo-600">
                    {cohort.referral_intent_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep-Dive Grid: Monetization Economics & SLA Defense Engine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Left: ₹25 Pay-Per-Lead Monetization Health */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-600" /> ₹25 Pay-Per-Lead Economics
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Collection: {current.monetization.host_collection_rate_pct}%
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Pricing Model</span>
              <span className="font-mono font-semibold text-slate-800">
                ₹{current.monetization.fee_per_lead_inr} / Qualified Lead
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Gross Lead Revenue ({current.monetization.total_qualified_leads} leads)</span>
              <span className="font-semibold text-slate-900">
                ₹{current.monetization.gross_revenue_inr.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Direct Dispatch Cost (SMS/WhatsApp gateway)</span>
              <span className="text-rose-600 font-medium">
                -₹{current.monetization.total_dispatch_cost_inr.toFixed(2)} (₹{current.monetization.dispatch_cost_per_lead_inr}/lead)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Net Gross Contribution</span>
              <span className="font-bold text-emerald-600">
                ₹{current.monetization.net_gross_profit_inr.toLocaleString()} ({current.monetization.net_contribution_margin_pct}%)
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Host Satisfaction &amp; Payback</span>
              <span className="font-semibold text-slate-800">
                {current.monetization.provider_satisfaction_pct}% happy • {current.monetization.payback_period_days}d payback
              </span>
            </div>
          </div>
        </div>

        {/* Right: Host SLA Compliance & Auto-Reassignment */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" /> Host SLA Response Engine
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
              Target: &lt; 4.0h SLA
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Observed Average Response Time</span>
              <span className="font-bold text-slate-900">{current.host_sla.observed_avg_sla_hours} hours</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Leads Dispatched / Within SLA</span>
              <span className="font-semibold text-emerald-700">
                {current.host_sla.within_sla_count} / {current.host_sla.total_leads_dispatched} ({current.host_sla.sla_compliance_pct}%)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Breached &amp; Auto-Reassigned Leads</span>
              <span className="font-semibold text-amber-700">
                {current.host_sla.auto_reassigned_count} re-assigned to secondary hosts
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Response Speed Spectrum</span>
              <span className="text-slate-700">
                Fastest: {current.host_sla.fastest_response_minutes}m • Slowest: {current.host_sla.slowest_response_hours}h
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Traveler Trip-Cycle Repeat / Referral</span>
              <span className="font-bold text-purple-700">
                {current.retention_referral.repeat_trip_planning_intent_pct}% Intent • +{current.retention_referral.net_promoter_score} NPS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
