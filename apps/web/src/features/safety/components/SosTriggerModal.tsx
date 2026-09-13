"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  AlertOctagon,
  X,
  Phone,
  Radio,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

export type IncidentLifecycleStatus =
  | 'TRIGGERED'
  | 'ACKNOWLEDGED'
  | 'DISPATCHED'
  | 'RESPONDING'
  | 'ON_SCENE'
  | 'RESOLVED';

interface SosTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSos: (data: {
    latitude: number;
    longitude: number;
    type: string;
    description: string;
  }) => Promise<{ id: string; status: IncidentLifecycleStatus }>;
}

export const SosTriggerModal: React.FC<SosTriggerModalProps> = ({
  isOpen,
  onClose,
  onTriggerSos,
}) => {
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);
  const [activeIncidentStatus, setActiveIncidentStatus] =
    useState<IncidentLifecycleStatus | null>(null);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
          });
        },
        () => {
          // Fallback coordinates for Raipur central hub
          setCoords({ lat: 21.2514, lng: 81.6296 });
        },
      );
    }
  }, [isOpen]);

  useEffect(() => {
    if (isHolding) {
      const interval = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            handleActivate();
            return 100;
          }
          return prev + 5;
        });
      }, 50); // 1000ms total to fill 100%
      return () => clearInterval(interval);
    } else {
      setHoldProgress(0);
    }
  }, [isHolding]);

  const handleActivate = async () => {
    setIsHolding(false);
    setIsTriggering(true);

    const lat = coords?.lat ?? 21.2514;
    const lng = coords?.lng ?? 81.6296;

    try {
      const res = await onTriggerSos({
        latitude: lat,
        longitude: lng,
        type: 'MEDICAL',
        description: 'Tourist SOS triggered from web portal',
      });
      setIncidentId(res.id);
      setActiveIncidentStatus(res.status);
    } catch {
      setActiveIncidentStatus('TRIGGERED');
    } finally {
      setIsTriggering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-zinc-950 text-white border border-rose-900/40 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2 text-rose-500">
            <ShieldAlert className="h-6 w-6 animate-pulse" />
            <h3 className="font-bold text-lg text-white">Emergency SOS</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {activeIncidentStatus ? (
          /* Live Incident Tracking State Machine View */
          <div className="mt-6 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 mb-3 animate-pulse">
              <Radio className="h-8 w-8" />
            </div>

            <h4 className="font-bold text-xl text-white">
              SOS Broadcast Active
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Incident {incidentId ? `#${incidentId.slice(-6).toUpperCase()}` : 'Dispatched'} • GPS ({coords?.lat}, {coords?.lng})
            </p>

            {/* Stepper */}
            <div className="w-full mt-6 flex flex-col gap-3">
              {(
                [
                  { key: 'TRIGGERED', label: '1. Incident Broadcasted' },
                  { key: 'ACKNOWLEDGED', label: '2. Responder Acknowledged' },
                  { key: 'DISPATCHED', label: '3. Team Dispatched' },
                  { key: 'ON_SCENE', label: '4. Rescue On Scene' },
                  { key: 'RESOLVED', label: '5. Resolved & Safe' },
                ] as const
              ).map((step, idx) => {
                const isCurrent = activeIncidentStatus === step.key;
                const isPast =
                  ['TRIGGERED', 'ACKNOWLEDGED', 'DISPATCHED', 'ON_SCENE', 'RESOLVED'].indexOf(
                    activeIncidentStatus,
                  ) >= idx;

                return (
                  <div
                    key={step.key}
                    className={`flex items-center gap-3 rounded-xl p-3 border text-xs transition-all ${
                      isCurrent
                        ? 'border-rose-500 bg-rose-950/40 text-rose-200 font-semibold'
                        : isPast
                        ? 'border-zinc-800 bg-zinc-900/60 text-zinc-300'
                        : 'border-zinc-900 bg-zinc-950 text-zinc-600'
                    }`}
                  >
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        isCurrent
                          ? 'bg-rose-500 animate-ping'
                          : isPast
                          ? 'bg-emerald-500'
                          : 'bg-zinc-800'
                      }`}
                    />
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-zinc-800 py-3 text-xs font-semibold hover:bg-zinc-700"
            >
              Close Window (SOS remains active)
            </button>
          </div>
        ) : (
          /* Hold to trigger SOS interface */
          <div className="mt-6 flex flex-col items-center">
            <p className="text-xs text-zinc-400 text-center max-w-xs mb-6">
              Press and hold the button below for 2 seconds to dispatch immediate emergency assistance to your location.
            </p>

            {/* Hold Button */}
            <div className="relative flex items-center justify-center mb-6">
              {/* Progress Ring */}
              <svg className="h-44 w-44 -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="78"
                  className="stroke-zinc-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="78"
                  className="stroke-rose-600 transition-all duration-75"
                  strokeWidth="8"
                  strokeDasharray={490}
                  strokeDashoffset={490 - (490 * holdProgress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <button
                onMouseDown={() => setIsHolding(true)}
                onMouseUp={() => setIsHolding(false)}
                onTouchStart={() => setIsHolding(true)}
                onTouchEnd={() => setIsHolding(false)}
                disabled={isTriggering}
                className="absolute h-36 w-36 rounded-full bg-gradient-to-br from-rose-600 to-red-700 flex flex-col items-center justify-center text-white shadow-lg shadow-rose-900/50 hover:brightness-110 active:scale-95 transition-all select-none"
              >
                {isTriggering ? (
                  <Loader2 className="h-10 w-10 animate-spin" />
                ) : (
                  <>
                    <AlertOctagon className="h-10 w-10 mb-1" />
                    <span className="font-extrabold text-sm tracking-wider uppercase">
                      Hold SOS
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Live GPS coords indicator */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
              <MapPin className="h-3.5 w-3.5 text-rose-500" />
              <span>
                Coordinates: {coords ? `${coords.lat}, ${coords.lng}` : 'Locating GPS...'}
              </span>
            </div>

            {/* Direct Dial Helplines */}
            <div className="w-full pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span>Immediate Direct Dial:</span>
              <div className="flex gap-2 font-bold text-rose-400">
                <a href="tel:112" className="hover:underline">112 (Police)</a>
                <span>•</span>
                <a href="tel:108" className="hover:underline">108 (Ambulance)</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
