"use client";

import { useState } from "react";
import { createBooking, authenticateTestUser } from "../app/data/api";
import { useLanguage } from "../context/LanguageContext";
import { Calendar, Users, Phone, MapPin, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface BookingWidgetProps {
  placeId: string;
  placeName: string;
}

export default function BookingWidget({ placeId, placeName }: BookingWidgetProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError("Please select a visit date.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // For demo purposes, we automatically authenticate the test user
      const token = await authenticateTestUser();
      if (!token) throw new Error("Authentication failed");

      await createBooking({
        placeId,
        visitDate: new Date(date).toISOString(),
        guests,
        contactPhone: phone,
        notes
      }, token);

      setSuccess(true);
      setTimeout(() => {
        router.push('/bookings');
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-forest-emerald/30 shadow-md flex flex-col items-center justify-center gap-4 text-center bg-forest-emerald/5 min-h-[300px]">
        <CheckCircle className="w-16 h-16 text-forest-emerald" />
        <h3 className="text-xl font-sans font-bold text-forest-emerald">Booking Confirmed!</h3>
        <p className="text-sm text-charcoal-stone/70">Your reservation for {placeName} is complete. Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md flex flex-col gap-5">
      <div className="flex items-center gap-3 border-b border-charcoal-stone/10 pb-3">
        <MapPin className="w-5 h-5 text-tribal-terracotta" />
        <h3 className="font-sans font-bold text-lg text-forest-emerald">
          Plan Your Visit
        </h3>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleBook} className="flex flex-col gap-4">
        {/* Date Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono text-charcoal-stone/60 uppercase font-bold">Visit Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-stone/40" />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-charcoal-stone/20 bg-white text-sm focus:outline-none focus:border-forest-emerald focus:ring-1 focus:ring-forest-emerald transition-all"
              required
            />
          </div>
        </div>

        {/* Guest Counter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono text-charcoal-stone/60 uppercase font-bold">Guests</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-stone/40" />
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-charcoal-stone/20 bg-white text-sm focus:outline-none focus:border-forest-emerald focus:ring-1 focus:ring-forest-emerald transition-all appearance-none"
            >
              {[1,2,3,4,5,6,7,8,9,10].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Contact Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono text-charcoal-stone/60 uppercase font-bold">Contact Phone (Optional)</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-stone/40" />
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-charcoal-stone/20 bg-white text-sm focus:outline-none focus:border-forest-emerald focus:ring-1 focus:ring-forest-emerald transition-all"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono text-charcoal-stone/60 uppercase font-bold">Special Requests</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific requirements?"
            className="w-full px-4 py-2.5 rounded-xl border border-charcoal-stone/20 bg-white text-sm focus:outline-none focus:border-forest-emerald focus:ring-1 focus:ring-forest-emerald transition-all min-h-[80px] resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3 rounded-xl bg-forest-emerald text-sand-beige font-bold text-sm shadow-md shadow-forest-emerald/20 hover:bg-tribal-terracotta hover:shadow-tribal-terracotta/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Confirming...
            </>
          ) : (
            'Book Reservation'
          )}
        </button>
      </form>
    </div>
  );
}
