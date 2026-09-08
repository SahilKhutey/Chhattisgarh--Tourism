"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Coins,
  IndianRupee,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  authenticateTestUser,
  fetchAllPartners,
  verifyPartner,
} from "../../data/api";

interface PartnerItem {
  id: string;
  name: string;
  slug: string;
  email?: string | null;
  phone?: string | null;
  districtId?: string | null;
  status: "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "SUSPENDED" | "REJECTED";
  createdAt: string;
}

export default function AdminMarketplacePage() {
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const loadPartners = async () => {
    try {
      setLoading(true);
      const data = await fetchAllPartners();
      setPartners(data.items || []);
    } catch {
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(loadPartners);
  }, []);

  const handleUpdateStatus = async (partnerId: string, status: string) => {
    try {
      const token = await authenticateTestUser();
      await verifyPartner(partnerId, status, token);
      loadPartners();
    } catch (err: unknown) {
      alert("Status update failed: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const filteredPartners = partners.filter((p) => {
    if (filterStatus === "ALL") return true;
    return p.status === filterStatus;
  });

  const verifiedCount = partners.filter((p) => p.status === "VERIFIED").length;
  const pendingCount = partners.filter((p) => p.status === "PENDING").length;

  return (
    <div className="w-full min-h-screen bg-sand-beige text-charcoal-stone pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-charcoal-stone/60 hover:text-charcoal-stone"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
            </Link>
            <h1 className="text-3xl font-serif font-bold text-charcoal-stone">
              Marketplace & Partner Administration
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-stone/70">
              Review partner credentials, oversee commission settlements, and regulate regional tourism commerce.
            </p>
          </div>
          <button
            onClick={loadPartners}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-charcoal-stone/10 hover:bg-charcoal-stone/15 text-xs font-semibold self-start sm:self-auto transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-charcoal-stone/5 border border-charcoal-stone/10 flex flex-col gap-1">
            <span className="text-[11px] font-mono text-charcoal-stone/50 uppercase">Total Partners</span>
            <span className="text-2xl font-bold font-serif">{partners.length}</span>
          </div>
          <div className="p-5 rounded-2xl bg-forest-emerald/10 border border-forest-emerald/20 flex flex-col gap-1">
            <span className="text-[11px] font-mono text-forest-emerald uppercase">Verified Active</span>
            <span className="text-2xl font-bold font-serif text-forest-emerald">{verifiedCount}</span>
          </div>
          <div className="p-5 rounded-2xl bg-terracotta-warm/10 border border-terracotta-warm/20 flex flex-col gap-1">
            <span className="text-[11px] font-mono text-terracotta-warm uppercase">Pending Verification</span>
            <span className="text-2xl font-bold font-serif text-terracotta-warm">{pendingCount}</span>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 border-b border-charcoal-stone/10 pb-3">
          {["ALL", "PENDING", "VERIFIED", "SUSPENDED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === s
                  ? "bg-forest-emerald text-sand-beige"
                  : "bg-charcoal-stone/5 text-charcoal-stone/70 hover:bg-charcoal-stone/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Partner Registry Table */}
        <div className="rounded-2xl border border-charcoal-stone/15 overflow-hidden bg-sand-beige shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-stone/5 border-b border-charcoal-stone/10 text-charcoal-stone/60 font-mono uppercase">
                <tr>
                  <th className="p-4">Partner Name</th>
                  <th className="p-4">District</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-stone/10">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-charcoal-stone/50">
                      Loading partners...
                    </td>
                  </tr>
                ) : filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-charcoal-stone/50">
                      No partners found matching this status filter.
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map((p) => (
                    <tr key={p.id} className="hover:bg-charcoal-stone/5 transition-colors">
                      <td className="p-4 font-semibold text-charcoal-stone">
                        {p.name}
                        <span className="block text-[10px] font-mono text-charcoal-stone/40">
                          {p.slug}
                        </span>
                      </td>
                      <td className="p-4 text-charcoal-stone/70 uppercase font-mono">
                        {p.districtId || "—"}
                      </td>
                      <td className="p-4 text-charcoal-stone/70 font-mono">
                        {p.phone || p.email || "—"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-semibold ${
                            p.status === "VERIFIED"
                              ? "bg-forest-emerald/10 text-forest-emerald"
                              : p.status === "PENDING"
                              ? "bg-terracotta-warm/15 text-terracotta-warm"
                              : "bg-crimson-blaze/10 text-crimson-blaze"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.status !== "VERIFIED" && (
                            <button
                              onClick={() => handleUpdateStatus(p.id, "VERIFIED")}
                              className="px-2.5 py-1 rounded-lg bg-forest-emerald text-sand-beige text-[11px] font-medium hover:bg-forest-emerald/90 transition-colors"
                            >
                              Verify
                            </button>
                          )}
                          {p.status !== "SUSPENDED" && (
                            <button
                              onClick={() => handleUpdateStatus(p.id, "SUSPENDED")}
                              className="px-2.5 py-1 rounded-lg bg-crimson-blaze/10 text-crimson-blaze text-[11px] font-medium hover:bg-crimson-blaze/20 transition-colors"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
