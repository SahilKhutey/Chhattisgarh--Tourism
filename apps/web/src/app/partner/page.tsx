"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  IndianRupee,
  Layers,
  PlusCircle,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { registerPartner } from "../data/api";

export default function PartnerPortalPage() {
  const [activeTab, setActiveTab] = useState<"register" | "overview">("overview");
  const [formSuccess, setFormSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    districtId: "bastar",
    description: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerPartner(formData);
      setFormSuccess(true);
    } catch (err: unknown) {
      alert("Registration failed: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  return (
    <div className="w-full min-h-screen bg-sand-beige text-charcoal-stone pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-forest-emerald font-mono text-xs font-semibold uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            Regional Tourism Partner Network
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal-stone">
            Partner Portal & Operations
          </h1>
          <p className="text-charcoal-stone/75 text-sm sm:text-base max-w-2xl">
            Empowering indigenous homestay hosts, certified tribal guides, and regional eco-transport operators with direct digital commerce and verified bookings.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-charcoal-stone/10 gap-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm font-semibold transition-colors ${
              activeTab === "overview"
                ? "border-b-2 border-forest-emerald text-forest-emerald"
                : "text-charcoal-stone/60 hover:text-charcoal-stone"
            }`}
          >
            Network Benefits & Standards
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`pb-3 text-sm font-semibold transition-colors ${
              activeTab === "register"
                ? "border-b-2 border-forest-emerald text-forest-emerald"
                : "text-charcoal-stone/60 hover:text-charcoal-stone"
            }`}
          >
            Apply for Partner Verification
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-charcoal-stone/5 border border-charcoal-stone/10 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest-emerald/10 text-forest-emerald flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg">Official State Verification</h3>
                <p className="text-xs text-charcoal-stone/70 leading-relaxed">
                  Every partner is vetted by the district tourism council to ensure tourist safety, transparent fixed rates, and quality cultural storytelling.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-charcoal-stone/5 border border-charcoal-stone/10 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-terracotta-warm/10 text-terracotta-warm flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg">Direct Community Payouts</h3>
                <p className="text-xs text-charcoal-stone/70 leading-relaxed">
                  90% net revenue goes directly to the local host/operator. Transparent 10% platform fee supports infrastructure, mapping, and security.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-charcoal-stone/5 border border-charcoal-stone/10 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest-emerald/10 text-forest-emerald flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg">Integrated Itineraries</h3>
                <p className="text-xs text-charcoal-stone/70 leading-relaxed">
                  Verified inventory seamlessly plugs into our offline trip planner and district recommendation engine, reaching thousands of verified visitors.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-forest-emerald text-sand-beige flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-serif font-bold">Ready to register your tourism business?</h3>
                <p className="text-xs sm:text-sm text-sand-beige/80 max-w-xl">
                  Whether you operate a tribal homestay in Jagdalpur, guide hikes in Kanger Valley, or organize heritage excursions in Sirpur, join our certified network today.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("register")}
                className="px-6 py-3 rounded-xl bg-sand-beige text-forest-emerald font-semibold text-sm hover:bg-sand-beige/90 transition-colors whitespace-nowrap shadow-md"
              >
                Start Verification
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Register Form */}
        {activeTab === "register" && (
          <div className="max-w-2xl mx-auto w-full p-8 rounded-3xl bg-sand-beige border border-charcoal-stone/20 shadow-sm flex flex-col gap-6">
            {formSuccess ? (
              <div className="flex flex-col items-center text-center gap-4 py-8">
                <CheckCircle2 className="w-16 h-16 text-forest-emerald" />
                <h3 className="text-2xl font-serif font-bold">Application Received!</h3>
                <p className="text-sm text-charcoal-stone/70 max-w-md">
                  Your registration is under preliminary review. Our district tourism coordinator will contact you to verify identity and activate your marketplace inventory.
                </p>
                <Link
                  href="/experiences"
                  className="px-5 py-2.5 rounded-xl bg-forest-emerald text-sand-beige text-xs font-semibold hover:bg-forest-emerald/90 transition-colors"
                >
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-serif font-bold">Partner Registration</h3>
                  <p className="text-xs text-charcoal-stone/60">
                    Provide your operating details for administrative verification.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono font-semibold uppercase text-charcoal-stone/70">
                    Business / Operation Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bastar Tribal Homestay Collective"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-stone/20 bg-charcoal-stone/5 text-sm focus:ring-2 focus:ring-forest-emerald focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-semibold uppercase text-charcoal-stone/70">
                      Primary Contact Email
                    </label>
                    <input
                      type="email"
                      placeholder="host@bastartours.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-stone/20 bg-charcoal-stone/5 text-sm focus:ring-2 focus:ring-forest-emerald focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-semibold uppercase text-charcoal-stone/70">
                      Mobile / Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-stone/20 bg-charcoal-stone/5 text-sm focus:ring-2 focus:ring-forest-emerald focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono font-semibold uppercase text-charcoal-stone/70">
                    Operating District
                  </label>
                  <select
                    value={formData.districtId}
                    onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-stone/20 bg-charcoal-stone/5 text-sm focus:ring-2 focus:ring-forest-emerald focus:outline-none"
                  >
                    <option value="bastar">Bastar (Jagdalpur)</option>
                    <option value="dantewada">Dantewada</option>
                    <option value="kondagaon">Kondagaon</option>
                    <option value="surguja">Surguja (Ambikapur)</option>
                    <option value="raipur">Raipur</option>
                    <option value="bilaspur">Bilaspur</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono font-semibold uppercase text-charcoal-stone/70">
                    Description of Services Offered
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your homestay rooms, guided cultural trails, tribal cuisine tastings, or transport services..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-stone/20 bg-charcoal-stone/5 text-sm focus:ring-2 focus:ring-forest-emerald focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-forest-emerald text-sand-beige font-semibold text-sm hover:bg-forest-emerald/90 transition-colors shadow-sm"
                >
                  Submit Application for Review
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
