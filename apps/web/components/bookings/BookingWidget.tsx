"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { getApiBase } from "@/app/data/api-config";
import { useAuthStore } from "@/store/auth-store";
import { Calendar, Users, Phone, MapPin, Loader2, CheckCircle, ShieldCheck } from "lucide-react";

export interface BookingWidgetProps {
  placeId: string;
  placeName: string;
  pricePerGuestPaise?: number;
  maxGuests?: number;
  token?: string;
  onBookingSuccess?: (bookingId: string) => void;
}

export interface BookingResponse {
  success: boolean;
  booking: {
    id: string;
    placeId: string;
    visitDate: string;
    guests: number;
    status: string;
  };
  pricing: {
    currency: string;
    unitPricePaise: number;
    subtotalPaise: number;
    platformFeePaise: number;
    totalPricePaise: number;
  };
}

export function BookingWidget({
  placeId,
  placeName,
  pricePerGuestPaise = 50000, // ₹500 default
  maxGuests = 20,
  token: explicitToken,
  onBookingSuccess,
}: BookingWidgetProps) {
  const { token: authStoreToken, user } = useAuthStore();
  const token = explicitToken || authStoreToken;

  const [visitDate, setVisitDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<BookingResponse | null>(null);

  // Tomorrow's date as min selectable date
  const minDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }, []);

  const subtotal = (pricePerGuestPaise ?? 50000) * guests;
  const estimatedPlatformFee = Math.floor((subtotal * 500) / 10000); // 5%
  const estimatedTotal = subtotal + estimatedPlatformFee;

  const formattedUnitPrice = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format((pricePerGuestPaise ?? 50000) / 100),
    [pricePerGuestPaise]
  );

  const formattedTotal = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(estimatedTotal / 100),
    [estimatedTotal]
  );

  const formattedSubtotal = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(subtotal / 100),
    [subtotal]
  );

  const formattedFee = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(estimatedPlatformFee / 100),
    [estimatedPlatformFee]
  );

  async function submitBooking(event: FormEvent) {
    event.preventDefault();

    if (!token) {
      setError("Please log in to book your visit to " + placeName);
      return;
    }

    if (!visitDate) {
      setError("Please select a valid visit date");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${getApiBase()}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          placeId,
          visitDate: new Date(visitDate).toISOString(),
          guests,
          contactPhone: phone || undefined,
          notes: notes || undefined,
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(body.message)
            ? body.message.join(", ")
            : body.message ?? "Booking failed"
        );
      }

      setSuccess(body);
      onBookingSuccess?.(body.booking.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create booking");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section className="glass-panel p-6 rounded-3xl border border-forest-emerald/30 shadow-xl bg-forest-emerald/5 min-h-[300px] flex flex-col justify-center gap-4 text-center">
        <CheckCircle className="w-14 h-14 text-forest-emerald mx-auto" />
        <h2 className="text-xl font-sans font-bold text-forest-emerald">
          Booking Confirmed!
        </h2>
        <p className="text-sm text-charcoal-stone/80">
          Your reservation for <strong className="text-forest-emerald">{placeName}</strong> has been secured in the CG Tourism system.
        </p>

        <div className="mt-2 rounded-2xl bg-white/80 p-4 border border-forest-emerald/20 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-charcoal-stone/70">Booking ID:</span>
            <strong className="font-mono text-charcoal-stone">{success.booking.id.slice(0, 8)}...</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-stone/70">Guests:</span>
            <strong>{guests} Guest{guests > 1 ? "s" : ""}</strong>
          </div>
          <div className="flex justify-between border-t border-charcoal-stone/10 pt-2 text-sm">
            <span className="font-bold text-charcoal-stone">Total Paid:</span>
            <strong className="text-forest-emerald">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: success.pricing.currency || "INR",
                maximumFractionDigits: 0,
              }).format(success.pricing.totalPricePaise / 100)}
            </strong>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-charcoal-stone/60 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-forest-emerald" />
          <span>Verified CG Tourism Partner Ticket</span>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={submitBooking}
      className="glass-panel p-6 rounded-3xl border border-white/60 shadow-lg flex flex-col gap-5 bg-white/90 backdrop-blur-md"
    >
      <div className="flex items-center justify-between border-b border-charcoal-stone/10 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-tribal-terracotta" />
          <h2 className="font-sans font-bold text-lg text-forest-emerald">
            Plan Your Visit
          </h2>
        </div>
        <span className="text-xs font-bold text-charcoal-stone/80 bg-forest-emerald/10 text-forest-emerald px-2.5 py-1 rounded-full">
          {formattedUnitPrice} / guest
        </span>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-bold"
        >
          {error}
        </div>
      )}

      {/* Visit Date */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="visit-date" className="text-[10px] font-mono text-charcoal-stone/60 uppercase font-bold">
          Visit Date *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-stone/40" />
          <input
            id="visit-date"
            type="date"
            required
            min={minDate}
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-stone/20 bg-white text-sm focus:outline-none focus:border-forest-emerald focus:ring-1 focus:ring-forest-emerald transition-all"
          />
        </div>
      </div>

      {/* Guest Selector */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="guests" className="text-[10px] font-mono text-charcoal-stone/60 uppercase font-bold">
          Number of Guests (Max {maxGuests}) *
        </label>
        <div className="relative">
          <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-stone/40" />
          <input
            id="guests"
            type="number"
            min={1}
            max={maxGuests}
            value={guests}
            onChange={(e) =>
              setGuests(Math.max(1, Math.min(maxGuests, Number(e.target.value) || 1)))
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-stone/20 bg-white text-sm focus:outline-none focus:border-forest-emerald focus:ring-1 focus:ring-forest-emerald transition-all"
          />
        </div>
      </div>

      {/* Contact Phone */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-[10px] font-mono text-charcoal-stone/60 uppercase font-bold">
          Contact Phone (Optional)
        </label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-stone/40" />
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-stone/20 bg-white text-sm focus:outline-none focus:border-forest-emerald focus:ring-1 focus:ring-forest-emerald transition-all"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-[10px] font-mono text-charcoal-stone/60 uppercase font-bold">
          Special Requests / Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Accessibility assistance, local guide request..."
          className="w-full px-4 py-2.5 rounded-xl border border-charcoal-stone/20 bg-white text-sm focus:outline-none focus:border-forest-emerald focus:ring-1 focus:ring-forest-emerald transition-all min-h-[70px] resize-none"
        />
      </div>

      {/* Pricing Breakdown Box */}
      <div className="rounded-2xl border border-charcoal-stone/15 bg-sand-beige/40 p-4 space-y-1.5 text-xs text-charcoal-stone/80">
        <div className="flex justify-between">
          <span>Tickets ({guests} × {formattedUnitPrice})</span>
          <span className="font-semibold">{formattedSubtotal}</span>
        </div>
        <div className="flex justify-between">
          <span>Platform Service Fee (5%)</span>
          <span className="font-semibold">{formattedFee}</span>
        </div>
        <div className="border-t border-charcoal-stone/15 pt-2 flex justify-between text-sm font-bold text-charcoal-stone">
          <span>Estimated Total</span>
          <span className="text-forest-emerald text-base">{formattedTotal}</span>
        </div>
        <p className="pt-1 text-[10px] text-charcoal-stone/50 italic">
          Final pricing is calculated securely by the backend from the destination&apos;s configured booking rate.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-2xl bg-forest-emerald hover:bg-[#0A2A3B] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Confirming Reservation...</span>
          </>
        ) : (
          `Book Now • ${formattedTotal}`
        )}
      </button>
    </form>
  );
}

export default BookingWidget;
