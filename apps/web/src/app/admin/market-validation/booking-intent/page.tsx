"use client";

import React, { useEffect, useState } from "react";
import { BookingSummary } from "@/components/market-validation/BookingSummary";

interface BookingIntentItem {
  id: string;
  provider_id: string;
  destination_id?: string;
  party_size: number;
  travel_date: string;
  end_date?: string;
  estimated_amount?: number;
  payment_preference: string;
  status: string;
  cancellation_reason?: string;
  created_at: string;
}

export default function BookingIntentAdminPage() {
  const [intents, setIntents] = useState<BookingIntentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchIntents = () => {
    setLoading(true);
    const query = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
    fetch(`/api/v1/market-validation/booking-intents${query}`, {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((data) => {
        setIntents(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setIntents([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchIntents();
  }, [statusFilter]);

  const handleConfirm = (id: string) => {
    fetch(`/api/v1/market-validation/booking-intents/${id}/confirm`, {
      method: "POST",
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then(() => fetchIntents())
      .catch((err) => alert(err.message));
  };

  const handleCancel = (id: string, reason: string) => {
    fetch(`/api/v1/market-validation/booking-intents/${id}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "MARKET_RESEARCHER",
      },
      body: JSON.stringify({ reason }),
    })
      .then(() => fetchIntents())
      .catch((err) => alert(err.message));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
            Transaction Validation • MV7
          </span>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Booking Intent Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage high-intent traveler booking requests, track operator confirmations, and validate conversion velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading booking intents...</div>
      ) : intents.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-sm">
          No booking intents found for current criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {intents.map((intent) => (
            <BookingSummary
              key={intent.id}
              intentId={intent.id}
              status={intent.status}
              travelDate={intent.travel_date ? intent.travel_date.split("T")[0] : "TBD"}
              endDate={intent.end_date ? intent.end_date.split("T")[0] : undefined}
              partySize={intent.party_size}
              estimatedAmount={intent.estimated_amount}
              paymentPreference={intent.payment_preference}
              cancellationReason={intent.cancellation_reason}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
