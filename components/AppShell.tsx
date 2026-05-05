"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Header } from "./Header";
import { LocationGate } from "./LocationGate";
import { AddCourtDialog } from "./AddCourtDialog";
import { ServiceWorkerRegistration } from "./ServiceWorkerRegistration";
import {
  deleteLocalCourt,
  readLocalCourts,
} from "@/lib/localCourts";
import type { Coordinates, LocalCourt } from "@/types/court";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100" aria-hidden />,
});

export function AppShell() {
  const [center, setCenter] = useState<Coordinates | null>(null);
  const [resolved, setResolved] = useState(false);
  const [osmCount, setOsmCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localCourts, setLocalCourts] = useState<LocalCourt[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [focusCoords, setFocusCoords] = useState<Coordinates | null>(null);
  const [searchTrigger, setSearchTrigger] = useState(0);

  useEffect(() => {
    setLocalCourts(readLocalCourts());
  }, []);

  const status: "locating" | "ready" | "error" = !resolved
    ? "locating"
    : error
      ? "error"
      : "ready";

  const totalCount =
    osmCount === null ? null : osmCount + localCourts.length;

  const handleDeleteLocal = useCallback((id: string) => {
    setLocalCourts(deleteLocalCourt(id));
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <ServiceWorkerRegistration />
      <LocationGate
        onResolve={(coords) => {
          setCenter(coords);
          setResolved(true);
        }}
      />
      {resolved ? (
        <Map
          center={center}
          localCourts={localCourts}
          focusCoords={focusCoords}
          searchTrigger={searchTrigger}
          onCountChange={setOsmCount}
          onError={setError}
          onDeleteLocal={handleDeleteLocal}
        />
      ) : (
        <div className="h-full w-full bg-gray-100" aria-hidden />
      )}
      <Header count={totalCount} status={status} errorMessage={error} />
      {resolved ? (
        <button
          type="button"
          onClick={() => setSearchTrigger((t) => t + 1)}
          className="absolute left-1/2 top-16 z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-lg ring-1 ring-black/5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="text-gray-700"
          >
            <circle
              cx="7"
              cy="7"
              r="5"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M11 11l3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          Search this area
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => setShowDialog(true)}
        aria-label="Add a court"
        className="absolute bottom-6 right-6 z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-3xl font-light leading-none text-white shadow-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
      >
        +
      </button>
      {showDialog ? (
        <AddCourtDialog
          onClose={() => setShowDialog(false)}
          onSaved={(court) => {
            setLocalCourts((prev) => [...prev, court]);
            setFocusCoords({ ...court.coordinates });
            setShowDialog(false);
          }}
        />
      ) : null}
    </main>
  );
}
