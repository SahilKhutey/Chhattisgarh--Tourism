"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  IndianRupee,
  Info,
  Loader2,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  authenticateTestUser,
  createMarketplaceBooking,
  fetchMarketplaceProductBySlug,
  MarketplaceProductItem,
} from "../../data/api";

export default function ExperienceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<MarketplaceProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [confirmedReference, setConfirmedReference] = useState<string | null>(null);

  const loadData = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const data = await fetchMarketplaceProductBySlug(slug);
      if (!data) {
        setError("Experience not found");
      } else {
        setProduct(data);
        if (data.availability && data.availability.length > 0) {
          const firstAvailable = data.availability.find((s) => !s.isSoldOut);
          if (firstAvailable) setSelectedSlotId(firstAvailable.id);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(loadData);
  }, [slug]);

  const selectedSlot = product?.availability?.find((s) => s.id === selectedSlotId);
  const maxAvailable = selectedSlot ? selectedSlot.availableCapacity : 0;
  const unitPrice = product ? Number(product.price) : 0;
  const totalAmount = unitPrice * quantity;

  const handleBookNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !selectedSlotId) return;

    try {
      setBookingInProgress(true);
      const token = await authenticateTestUser();
      const res = await createMarketplaceBooking(
        {
          productId: product.id,
          availabilityId: selectedSlotId,
          quantity,
          contactPhone: contactPhone || undefined,
          notes: notes || undefined,
        },
        token
      );

      if (res.booking?.bookingReference) {
        setConfirmedReference(res.booking.bookingReference);
      } else {
        router.push("/bookings");
      }
    } catch (err: unknown) {
      alert("Booking failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-sand-beige text-charcoal-stone p-6">
        <Loader2 className="w-12 h-12 text-forest-emerald animate-spin" />
        <p className="font-semibold text-charcoal-stone/80">Loading experience details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-sand-beige text-charcoal-stone p-6 text-center">
        <h2 className="text-2xl font-bold font-serif">{error || "Product not found"}</h2>
        <Link
          href="/experiences"
          className="px-4 py-2 rounded-xl bg-forest-emerald text-sand-beige text-sm font-semibold"
        >
          Back to Experiences
        </Link>
      </div>
    );
  }

  if (confirmedReference) {
    return (
      <div className="w-full min-h-screen bg-sand-beige text-charcoal-stone pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto rounded-3xl bg-sand-beige border border-forest-emerald/30 p-8 shadow-xl flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-full bg-forest-emerald/10 flex items-center justify-center text-forest-emerald">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-serif font-bold text-charcoal-stone">
              Booking Confirmed!
            </h2>
            <p className="text-sm text-charcoal-stone/70">
              Your regional experience reservation is confirmed and locked in the inventory.
            </p>
          </div>
          <div className="w-full bg-charcoal-stone/5 rounded-2xl p-4 font-mono text-xs flex flex-col gap-2 border border-charcoal-stone/10">
            <div className="flex justify-between">
              <span className="text-charcoal-stone/60">Booking Reference:</span>
              <span className="font-bold text-forest-emerald">{confirmedReference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-stone/60">Experience:</span>
              <span className="font-semibold text-charcoal-stone">{product.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-stone/60">Guests / Quantity:</span>
              <span>{quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-stone/60">Total Paid:</span>
              <span className="font-bold">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-4 w-full">
            <Link
              href="/bookings"
              className="flex-1 py-3 text-center rounded-xl bg-forest-emerald text-sand-beige text-sm font-semibold hover:bg-forest-emerald/90 transition-colors"
            >
              View My Bookings
            </Link>
            <Link
              href="/experiences"
              className="flex-1 py-3 text-center rounded-xl border border-charcoal-stone/20 text-sm font-semibold hover:bg-charcoal-stone/5 transition-colors"
            >
              Browse More
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-sand-beige text-charcoal-stone pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Navigation back */}
        <Link
          href="/experiences"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-charcoal-stone/70 hover:text-charcoal-stone"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Regional Experiences
        </Link>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Details (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold uppercase px-3 py-1 rounded-full bg-forest-emerald/10 text-forest-emerald">
                  {product.type}
                </span>
                {product.partner?.status === "VERIFIED" && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-forest-emerald font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Local Operator
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal-stone">
                {product.name}
              </h1>
              <p className="text-sm font-medium text-charcoal-stone/60">
                Operated by <span className="text-charcoal-stone font-semibold">{product.partner?.name}</span>
              </p>
            </div>

            {/* Key Specs */}
            <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-charcoal-stone/5 border border-charcoal-stone/10">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-mono text-charcoal-stone/50">Capacity</span>
                <span className="font-semibold text-sm flex items-center gap-1">
                  <Users className="w-4 h-4 text-forest-emerald" /> Max {product.capacity}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-mono text-charcoal-stone/50">Duration</span>
                <span className="font-semibold text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4 text-terracotta-warm" />
                  {product.durationMin ? `${product.durationMin} mins` : "Flexible"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-mono text-charcoal-stone/50">District</span>
                <span className="font-semibold text-sm flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-charcoal-stone/70" />
                  {product.partner?.districtId ? product.partner.districtId.toUpperCase() : "CHHATTISGARH"}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-serif font-bold">About this Experience</h3>
              <p className="text-sm text-charcoal-stone/80 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Cancellation Policy */}
            {product.policy && (
              <div className="p-6 rounded-2xl bg-terracotta-warm/10 border border-terracotta-warm/20 flex flex-col gap-2">
                <h4 className="font-serif font-bold text-base flex items-center gap-2">
                  <Info className="w-4 h-4 text-terracotta-warm" />
                  Cancellation & Refund Policy
                </h4>
                <ul className="text-xs text-charcoal-stone/80 space-y-1 list-disc pl-5">
                  <li>
                    <strong>100% Refund</strong> if cancelled up to {product.policy.fullRefundHours} hours before slot start.
                  </li>
                  <li>
                    <strong>{product.policy.partialRefundPercent}% Refund</strong> if cancelled between {product.policy.partialRefundHours} and {product.policy.fullRefundHours} hours before slot start.
                  </li>
                  <li>No refunds for cancellations within {product.policy.partialRefundHours} hours of start time.</li>
                </ul>
              </div>
            )}
          </div>

          {/* Booking Widget (1 col) */}
          <div className="lg:col-span-1">
            <form
              onSubmit={handleBookNow}
              className="sticky top-28 rounded-3xl bg-sand-beige border border-charcoal-stone/20 p-6 shadow-md flex flex-col gap-6"
            >
              <div className="flex items-baseline justify-between border-b border-charcoal-stone/10 pb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-sans text-charcoal-stone flex items-center">
                    <IndianRupee className="w-5 h-5" />
                    {unitPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-charcoal-stone/60">/ person</span>
                </div>
                <span className="text-xs font-mono text-forest-emerald font-semibold">
                  Instant Confirmation
                </span>
              </div>

              {/* Slot Picker */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono font-semibold uppercase text-charcoal-stone/70">
                  Select Date & Slot
                </label>
                {product.availability && product.availability.length > 0 ? (
                  <select
                    value={selectedSlotId}
                    onChange={(e) => setSelectedSlotId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-stone/20 bg-charcoal-stone/5 text-xs font-medium focus:ring-2 focus:ring-forest-emerald focus:outline-none"
                    required
                  >
                    <option value="" disabled>Choose an upcoming date...</option>
                    {product.availability.map((s) => (
                      <option key={s.id} value={s.id} disabled={s.isSoldOut}>
                        {new Date(s.startAt).toLocaleDateString("en-IN", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        ({s.isSoldOut ? "SOLD OUT" : `${s.availableCapacity} seats left`})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-terracotta-warm">
                    No open availability slots currently published.
                  </p>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono font-semibold uppercase text-charcoal-stone/70">
                    Guests / Slots
                  </label>
                  {selectedSlot && (
                    <span className="text-[11px] text-charcoal-stone/50 font-mono">
                      Available: {selectedSlot.availableCapacity}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  max={maxAvailable > 0 ? maxAvailable : 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2 rounded-xl border border-charcoal-stone/20 bg-charcoal-stone/5 text-sm font-semibold focus:ring-2 focus:ring-forest-emerald focus:outline-none"
                  required
                />
              </div>

              {/* Contact info */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono font-semibold uppercase text-charcoal-stone/70">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-charcoal-stone/20 bg-charcoal-stone/5 text-xs focus:ring-2 focus:ring-forest-emerald focus:outline-none"
                />
              </div>

              {/* Price Breakdown */}
              <div className="flex flex-col gap-2 pt-4 border-t border-charcoal-stone/10 text-xs">
                <div className="flex justify-between text-charcoal-stone/70">
                  <span>₹{unitPrice} × {quantity} guests</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-charcoal-stone/70">
                  <span>Platform & Taxes</span>
                  <span className="text-forest-emerald font-semibold">Included</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-charcoal-stone pt-2 border-t border-charcoal-stone/10">
                  <span>Total Amount</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={bookingInProgress || !selectedSlotId || maxAvailable < quantity}
                className="w-full py-3.5 rounded-xl bg-forest-emerald text-sand-beige font-semibold text-sm hover:bg-forest-emerald/90 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {bookingInProgress ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reserving & Locking...
                  </>
                ) : maxAvailable < quantity ? (
                  "Insufficient Capacity"
                ) : (
                  `Confirm Booking • ₹${totalAmount.toLocaleString()}`
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
