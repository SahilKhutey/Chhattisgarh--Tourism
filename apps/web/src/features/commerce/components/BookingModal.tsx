"use client";

import React, { useState } from 'react';
import { X, Calendar, Users, ShieldCheck, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export interface BookingProduct {
  id: string;
  name: string;
  partnerName: string;
  unitPricePaise: number;
  maxGuests: number;
  availableSlots: Array<{
    id: string;
    startAt: string;
    capacity: number;
    reserved: number;
  }>;
}

interface BookingModalProps {
  product: BookingProduct;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (bookingData: {
    productId: string;
    availabilityId: string;
    quantity: number;
    contactPhone: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirmBooking,
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    product.availableSlots[0]?.id || '',
  );
  const [guests, setGuests] = useState<number>(1);
  const [phone, setPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedSlot = product.availableSlots.find((s) => s.id === selectedSlotId);
  const remainingCapacity = selectedSlot
    ? selectedSlot.capacity - selectedSlot.reserved
    : 0;

  // Financial calculations in integer paise
  const unitPriceRupees = product.unitPricePaise / 100;
  const subtotalRupees = unitPriceRupees * guests;
  const platformFeeRupees = Math.floor(subtotalRupees * 0.05); // 5% platform fee
  const totalRupees = subtotalRupees + platformFeeRupees;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId) {
      setErrorMessage('Please select a visit date slot');
      return;
    }
    if (guests > remainingCapacity) {
      setErrorMessage(`Only ${remainingCapacity} slot(s) remaining for this time`);
      return;
    }
    if (!phone || phone.trim().length < 10) {
      setErrorMessage('Please provide a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await onConfirmBooking({
        productId: product.id,
        availabilityId: selectedSlotId,
        quantity: guests,
        contactPhone: phone.trim(),
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error || 'Failed to complete booking. Please try another slot.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Conflict: Slot capacity was just taken by another traveler.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 p-5">
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">
              Book Experience
            </h3>
            <p className="text-xs text-zinc-500">
              Verified Partner: {product.partnerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Reservation Held!
            </h4>
            <p className="text-sm text-zinc-500 mt-2 max-w-sm">
              Your slots are reserved in state <span className="font-semibold text-amber-600">PAYMENT_PENDING</span>.
              Confirmation will finalize upon payment gateway webhook.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            {/* Slot selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Select Date & Slot
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.availableSlots.map((slot) => {
                  const available = slot.capacity - slot.reserved;
                  const isFull = available <= 0;
                  const isSelected = selectedSlotId === slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isFull}
                      onClick={() => {
                        setSelectedSlotId(slot.id);
                        if (guests > available) setGuests(Math.max(1, available));
                      }}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                        isFull
                          ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      <span className="text-xs font-semibold">
                        {new Date(slot.startAt).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-[11px] text-zinc-500 mt-0.5">
                        {isFull ? 'Sold Out' : `${available} slot${available === 1 ? '' : 's'} remaining`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guest Count */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Travelers / Guests
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  disabled={guests <= 1}
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-bold text-lg disabled:opacity-40"
                >
                  -
                </button>
                <span className="font-bold text-lg w-8 text-center text-zinc-900 dark:text-zinc-100">
                  {guests}
                </span>
                <button
                  type="button"
                  disabled={guests >= Math.min(product.maxGuests, remainingCapacity)}
                  onClick={() => setGuests((g) => g + 1)}
                  className="h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-bold text-lg disabled:opacity-40"
                >
                  +
                </button>
                <span className="text-xs text-zinc-500">
                  Max allowed: {Math.min(product.maxGuests, remainingCapacity)}
                </span>
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Contact Mobile Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Price breakdown */}
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 p-4 flex flex-col gap-2 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>₹{unitPriceRupees} × {guests} guest{guests > 1 ? 's' : ''}</span>
                <span>₹{subtotalRupees}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Platform Governance Fee (5%)</span>
                <span>₹{platformFeeRupees}</span>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 flex justify-between font-bold text-sm text-zinc-900 dark:text-zinc-100">
                <span>Total Amount</span>
                <span>₹{totalRupees}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 p-3 text-xs text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || remainingCapacity === 0}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Holding Inventory...
                </>
              ) : (
                `Proceed to Pay ₹${totalRupees}`
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
