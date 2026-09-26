"use client";

import React, { useEffect, useState } from "react";
import { LeadTable, LeadItem } from "@/components/market-validation/LeadTable";

export default function LeadsAdminPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const fetchLeads = () => {
    setLoading(true);
    const query = filterStatus !== "ALL" ? `?status=${filterStatus}` : "";
    fetch(`/api/v1/market-validation/leads${query}`, {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setLeads([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeads();
  }, [filterStatus]);

  const handleQualify = (leadId: string) => {
    fetch(`/api/v1/market-validation/leads/${leadId}/qualify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "MARKET_RESEARCHER",
      },
      body: JSON.stringify({ qualified: true, outcome: "VERIFIED_QUALIFIED" }),
    })
      .then((res) => res.json())
      .then(() => fetchLeads())
      .catch((err) => alert(err.message));
  };

  const handleRecordResponse = (leadId: string) => {
    fetch(`/api/v1/market-validation/leads/${leadId}/response`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "MARKET_RESEARCHER",
      },
      body: JSON.stringify({ status: "RESPONDED", outcome: "ACCEPTED_BY_PROVIDER" }),
    })
      .then((res) => res.json())
      .then(() => fetchLeads())
      .catch((err) => alert(err.message));
  };

  const handleRecordBooking = (leadId: string) => {
    fetch(`/api/v1/market-validation/leads/${leadId}/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "MARKET_RESEARCHER",
      },
      body: JSON.stringify({ status: "BOOKED", conversion_status: "CONVERTED", outcome: "BOOKING_CONFIRMED" }),
    })
      .then((res) => res.json())
      .then(() => fetchLeads())
      .catch((err) => alert(err.message));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Demand Dispatch & Qualification • MV7
          </span>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Tourism Leads & Inquiry Validation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track traveler intent dispatched to local providers, measure SLA response turnaround, and qualify intent.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="RESPONDED">Responded</option>
            <option value="BOOKED">Booked</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading leads...</div>
      ) : (
        <LeadTable
          leads={leads}
          onQualify={handleQualify}
          onRecordResponse={handleRecordResponse}
          onRecordBooking={handleRecordBooking}
        />
      )}
    </div>
  );
}
