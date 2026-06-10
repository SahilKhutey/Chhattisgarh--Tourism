"use client";

import { useEffect, useState } from "react";
import { getMyBookings, authenticateTestUser, cancelBooking, Booking } from "../data/api";
import Link from "next/link";
import Image from "@/components/ui/NativeImage";
import { Calendar, Users, MapPin, XCircle, ArrowLeft, Loader2, IndianRupee } from "lucide-react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const token = await authenticateTestUser();
      const data = await getMyBookings(token);
      setBookings(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchBookings);
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const token = await authenticateTestUser();
      await cancelBooking(bookingId, token);
      fetchBookings(); // Refresh the list
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert("Failed to cancel booking: " + message);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-sand-beige text-charcoal-stone p-6 animate-pulse">
        <Loader2 className="w-16 h-16 text-forest-emerald animate-spin" />
        <h2 className="text-2xl font-sans font-bold">Loading Your Trips...</h2>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-sand-beige text-charcoal-stone pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-charcoal-stone/5 hover:bg-charcoal-stone/10 w-fit text-charcoal-stone/70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Explore
          </Link>
          <h1 className="text-4xl font-sans font-bold text-forest-emerald mt-2">
            My Reservations
          </h1>
          <p className="text-sm text-charcoal-stone/70">
            Manage your upcoming and past trips across Chhattisgarh.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-600 font-bold">
            {error}
          </div>
        )}

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-charcoal-stone/10 shadow-sm flex flex-col items-center justify-center gap-4 text-center">
            <Calendar className="w-16 h-16 text-charcoal-stone/20" />
            <h3 className="text-xl font-sans font-bold text-charcoal-stone/50">No Trips Planned Yet</h3>
            <p className="text-sm text-charcoal-stone/40 max-w-sm">
              You haven&apos;t made any reservations. Explore the incredible destinations of Chhattisgarh and start planning!
            </p>
            <Link 
              href="/explore" 
              className="mt-4 px-6 py-3 rounded-xl bg-forest-emerald text-sand-beige font-bold text-sm shadow hover:bg-tribal-terracotta transition-colors"
            >
              Discover Destinations
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((booking) => {
              const isCancelled = booking.status === "CANCELLED";
              const isPast = new Date(booking.visitDate) < new Date() && !isCancelled;
              
              return (
                <div 
                  key={booking.id} 
                  className={`glass-panel p-5 sm:p-6 rounded-2xl border transition-all flex flex-col sm:flex-row gap-6 ${
                    isCancelled ? 'border-red-200 bg-red-50/50 opacity-80' : 
                    isPast ? 'border-charcoal-stone/20 bg-charcoal-stone/5' : 
                    'border-forest-emerald/20 bg-white hover:shadow-md'
                  }`}
                >
                  {/* Image */}
                  <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden relative shrink-0">
                    <Image 
                      src={booking.place?.heroImage || '/fallback.jpg'} 
                      alt={booking.place?.name || 'Destination'}
                      fill
                      className={`object-cover ${isCancelled ? 'grayscale opacity-70' : ''}`}
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase backdrop-blur-md bg-black/40 text-white shadow-sm">
                      {booking.place?.category?.name || 'Destination'}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col flex-1 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-xl font-sans font-bold text-charcoal-stone">
                          {booking.place?.name || 'Unknown Destination'}
                        </h3>
                        <span className="text-xs text-charcoal-stone/60 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {booking.place?.district || 'Chhattisgarh'}
                        </span>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 w-fit ${
                        isCancelled ? 'bg-red-100 text-red-700 border border-red-200' :
                        isPast ? 'bg-charcoal-stone/10 text-charcoal-stone/70 border border-charcoal-stone/20' :
                        'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-auto">
                      <div className="flex items-center gap-2 text-sm text-charcoal-stone/80">
                        <Calendar className="w-4 h-4 text-forest-emerald" />
                        {new Date(booking.visitDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-charcoal-stone/80">
                        <Users className="w-4 h-4 text-forest-emerald" />
                        {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex flex-col items-start sm:items-end justify-between sm:border-l sm:border-charcoal-stone/10 sm:pl-6 gap-4">
                    <div className="flex flex-col sm:items-end gap-1">
                      <span className="text-[10px] font-mono text-charcoal-stone/50 uppercase font-bold">Total Price</span>
                      <span className="text-xl font-sans font-bold text-tribal-terracotta flex items-center gap-1">
                        <IndianRupee className="w-5 h-5" />
                        {booking.totalPrice}
                      </span>
                    </div>

                    {!isCancelled && !isPast && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="px-4 py-2 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 hover:border-red-300 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


