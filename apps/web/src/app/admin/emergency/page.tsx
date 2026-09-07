"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Plus,
  RefreshCw,
  ShieldAlert,
  Pencil,
  Power,
} from "lucide-react";

import { getApiBase } from "../../data/api-config";
import { useAuthStore } from "../../../store/auth-store";

type StationType = "POLICE" | "HOSPITAL" | "RANGER";

interface EmergencyStation {
  id: string;
  name: string;
  phone: string;
  type: StationType;
  district: string;
  division: string | null;
  latitude: number;
  longitude: number;
  active: boolean;
  priority: number;
  capabilities: string[];
  notes: string | null;
}

interface StationForm {
  name: string;
  phone: string;
  type: StationType;
  district: string;
  division: string;
  latitude: string;
  longitude: string;
  priority: string;
  notes: string;
}

const EMPTY_FORM: StationForm = {
  name: "",
  phone: "",
  type: "POLICE",
  district: "",
  division: "",
  latitude: "",
  longitude: "",
  priority: "0",
  notes: "",
};

const API = getApiBase();

export default function EmergencyAdminPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [stations, setStations] = useState<EmergencyStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StationForm>(EMPTY_FORM);

  const loadStations = async () => {
    if (!token) {
      setError("Authentication required.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API}/emergency/stations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load emergency stations (${response.status})`,
        );
      }

      const data = await response.json();

      setStations(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load emergency stations.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!token) {
      return;
    }

    fetch(`${API}/emergency/stations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load emergency stations (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted && data) {
          setStations(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load emergency stations.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!token) {
      setError("Authentication required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        type: form.type,
        district: form.district,
        division: form.division || undefined,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        priority: Number(form.priority),
        notes: form.notes || undefined,
      };

      const url = editingId
        ? `${API}/emergency/stations/${editingId}`
        : `${API}/emergency/stations`;

      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();

        throw new Error(
          body ||
            `Station operation failed (${response.status})`,
        );
      }

      resetForm();

      await loadStations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Station operation failed.",
      );
    } finally {
      setSaving(false);
    }
  };

  const editStation = (station: EmergencyStation) => {
    setEditingId(station.id);

    setForm({
      name: station.name,
      phone: station.phone,
      type: station.type,
      district: station.district,
      division: station.division ?? "",
      latitude: String(station.latitude),
      longitude: String(station.longitude),
      priority: String(station.priority),
      notes: station.notes ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleStation = async (
    station: EmergencyStation,
  ) => {
    if (!token) return;

    setError(null);

    try {
      const response = await fetch(
        `${API}/emergency/stations/${station.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            active: !station.active,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update station (${response.status})`,
        );
      }

      await loadStations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update station.",
      );
    }
  };

  if (
    user &&
    !["ADMIN", "SUPER_ADMIN"].includes(user.role)
  ) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8">
        <h1 className="text-xl font-semibold text-rose-300">
          Access Denied
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Emergency station management requires administrator
          privileges.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-rose-400" />

            <h1 className="text-3xl font-light text-white">
              Emergency Network
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Government-managed rescue responder registry.
          </p>
        </div>

        <button
          type="button"
          onClick={loadStations}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </header>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-white">
              {editingId
                ? "Edit Responder"
                : "Add Responder"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Verify operational contact information before
              activation.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <input
            required
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            placeholder="Station name"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-teal-500"
          />

          <input
            required
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
            placeholder="Phone"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-teal-500"
          />

          <select
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.value as StationType,
              })
            }
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
          >
            <option value="POLICE">Police</option>
            <option value="HOSPITAL">Hospital</option>
            <option value="RANGER">Ranger</option>
          </select>

          <input
            required
            value={form.district}
            onChange={(e) =>
              setForm({
                ...form,
                district: e.target.value,
              })
            }
            placeholder="District"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
          />

          <input
            value={form.division}
            onChange={(e) =>
              setForm({
                ...form,
                division: e.target.value,
              })
            }
            placeholder="Division"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
          />

          <input
            required
            type="number"
            step="any"
            min="-90"
            max="90"
            value={form.latitude}
            onChange={(e) =>
              setForm({
                ...form,
                latitude: e.target.value,
              })
            }
            placeholder="Latitude"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
          />

          <input
            required
            type="number"
            step="any"
            min="-180"
            max="180"
            value={form.longitude}
            onChange={(e) =>
              setForm({
                ...form,
                longitude: e.target.value,
              })
            }
            placeholder="Longitude"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
          />

          <input
            required
            type="number"
            min="0"
            max="1000"
            value={form.priority}
            onChange={(e) =>
              setForm({
                ...form,
                priority: e.target.value,
              })
            }
            placeholder="Priority"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
          />

          <textarea
            value={form.notes}
            onChange={(e) =>
              setForm({
                ...form,
                notes: e.target.value,
              })
            }
            placeholder="Operational notes"
            className="min-h-24 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white md:col-span-2"
          />

          <button
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-medium text-slate-950 hover:bg-teal-400 disabled:opacity-50 md:col-span-2"
          >
            {editingId ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}

            {saving
              ? "Saving..."
              : editingId
                ? "Update Station"
                : "Add Station"}
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-6">
          <h2 className="text-lg font-medium text-white">
            Responder Registry
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {stations.length} registered responder stations
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-sm text-slate-500">
            Loading emergency network...
          </div>
        ) : stations.length === 0 ? (
          <div className="p-8 text-sm text-slate-500">
            No emergency stations configured.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {stations.map((station) => (
              <div
                key={station.id}
                className="p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-medium text-white">
                        {station.name}
                      </h3>

                      <span
                        className={`rounded-full px-2 py-1 text-[10px] ${
                          station.active
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {station.active
                          ? "ACTIVE"
                          : "INACTIVE"}
                      </span>

                      <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] text-slate-400">
                        {station.type}
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-slate-400">
                      {station.district}
                      {station.division
                        ? ` · ${station.division}`
                        : ""}
                    </div>

                    <div className="mt-2 font-mono text-xs text-slate-500">
                      {station.latitude.toFixed(6)},{" "}
                      {station.longitude.toFixed(6)}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {station.phone} · Priority{" "}
                      {station.priority}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        editStation(station)
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleStation(station)
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
                    >
                      <Power className="h-4 w-4" />

                      {station.active
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
