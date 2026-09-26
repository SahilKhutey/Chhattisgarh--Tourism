"use client";

import React, { useEffect, useState } from "react";
import { TransactionStatus } from "@/components/market-validation/TransactionStatus";

interface TransactionItem {
  id: string;
  provider_id: string;
  consumer_id?: string;
  amount: number;
  currency: string;
  status: string;
  settlement_model: string;
  experience_date?: string;
  cancellation_reason?: string;
  created_at: string;
}

export default function TransactionsAdminPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchTransactions = () => {
    setLoading(true);
    const query = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
    fetch(`/api/v1/market-validation/transactions${query}`, {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setTransactions([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const handleComplete = (id: string) => {
    fetch(`/api/v1/market-validation/transactions/${id}/complete`, {
      method: "POST",
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then(() => fetchTransactions())
      .catch((err) => alert(err.message));
  };

  const handleCancel = (id: string) => {
    const reason = prompt("Enter cancellation reason:") || "Admin cancellation";
    fetch(`/api/v1/market-validation/transactions/${id}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "MARKET_RESEARCHER",
      },
      body: JSON.stringify({ reason }),
    })
      .then(() => fetchTransactions())
      .catch((err) => alert(err.message));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Commerce Validation • MV7
          </span>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Tourism Transactions & Settlement
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Verify completed tourism experiences, track GTV generation, and audit provider direct-payment flows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="INITIATED">Initiated</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-sm">
          No transactions found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactions.map((tx) => (
            <TransactionStatus
              key={tx.id}
              transactionId={tx.id}
              status={tx.status}
              amount={tx.amount}
              providerName={`Provider (${tx.provider_id.slice(0, 8)})`}
              consumerName={tx.consumer_id ? `Traveler (${tx.consumer_id.slice(0, 8)})` : "Direct Guest"}
              settlementModel={tx.settlement_model}
              experienceDate={tx.experience_date ? tx.experience_date.split("T")[0] : "Scheduled"}
              cancellationReason={tx.cancellation_reason}
              onComplete={handleComplete}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
