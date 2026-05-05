"use client";

import { useEffect, useRef, useState } from "react";
import type { Coordinates, LocalCourt } from "@/types/court";
import { addLocalCourt } from "@/lib/localCourts";

type GeocodeResult = {
  lat: number;
  lng: number;
  label: string;
};

type Props = {
  onClose: () => void;
  onSaved: (court: LocalCourt) => void;
};

export function AddCourtDialog({ onClose, onSaved }: Props) {
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [surface, setSurface] = useState("");
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [resolvedLabel, setResolvedLabel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleGeocode() {
    const q = address.trim();
    if (q.length < 3) {
      setError("Please enter an address");
      return;
    }
    setBusy(true);
    setError(null);
    setCoords(null);
    setResolvedLabel(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as
        | { results: GeocodeResult[] }
        | { error: string };
      if (!res.ok || "error" in data) {
        const msg = "error" in data ? data.error : `Lookup failed (${res.status})`;
        setError(msg);
        return;
      }
      const first = data.results[0];
      if (!first) {
        setError("No results for that address");
        return;
      }
      setCoords({ lat: first.lat, lng: first.lng });
      setResolvedLabel(first.label);
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  function handleSave() {
    if (!coords) return;
    const court = addLocalCourt({ name, surface, coordinates: coords });
    onSaved(court);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-court-title"
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2
            id="add-court-title"
            className="text-base font-semibold text-gray-900"
          >
            Add a court
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M4 4l8 8 M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-700">
              Address
            </span>
            <div className="flex gap-2">
              <input
                ref={firstFieldRef}
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleGeocode();
                  }
                }}
                placeholder="Rua do Sol 221, Vila Verde"
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
              <button
                type="button"
                onClick={handleGeocode}
                disabled={busy}
                className="rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                {busy ? "..." : "Find"}
              </button>
            </div>
            {resolvedLabel ? (
              <p className="mt-1 text-xs text-gray-600">Found, {resolvedLabel}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-700">
              Name (optional)
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Court at Rua do Sol"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-700">
              Surface (optional)
            </span>
            <input
              type="text"
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
              placeholder="concrete, asphalt, ..."
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </label>

          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!coords}
            className="rounded bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            Save court
          </button>
        </div>
      </div>
    </div>
  );
}
