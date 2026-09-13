"use client";

import { useState, useCallback } from "react";
import {
  createTrip,
  getTrip,
  generateItinerary,
  regenerateDay,
  explainItinerary,
  TripResponse,
  ApiItinerary,
  CreateTripPayload,
} from "../api/itinerary-api";

export function useTrip() {
  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [activeItinerary, setActiveItinerary] = useState<ApiItinerary | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startPlanning = useCallback(async (payload: CreateTripPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Create trip container
      const createdTrip = await createTrip(payload);
      setTrip(createdTrip);

      // 2. Generate initial itinerary
      const generated = await generateItinerary(createdTrip.id, {
        pace: payload.pace,
        categories: payload.categories,
        budgetAmount: payload.budgetAmount,
        accessibilityRequired: payload.accessibilityRequired,
      });
      setActiveItinerary(generated);

      // 3. Fetch explanation
      try {
        const exp = await explainItinerary(createdTrip.id);
        setExplanation(exp.narrative);
      } catch {
        // non-blocking
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate itinerary");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRegenerateDay = useCallback(async (daySequence: number, lockedStopIds?: string[]) => {
    if (!trip) return;
    setIsLoading(true);
    setError(null);
    try {
      const regenerated = await regenerateDay(trip.id, { daySequence, lockedStopIds });
      setActiveItinerary(regenerated);
    } catch (err: any) {
      setError(err.message || "Failed to regenerate day");
    } finally {
      setIsLoading(false);
    }
  }, [trip]);

  const reset = useCallback(() => {
    setActiveItinerary(null);
    setTrip(null);
    setExplanation("");
    setError(null);
  }, []);

  return {
    trip,
    activeItinerary,
    explanation,
    isLoading,
    error,
    startPlanning,
    handleRegenerateDay,
    reset,
  };
}
