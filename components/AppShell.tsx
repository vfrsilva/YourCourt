"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Header } from "./Header";
import { LocationGate } from "./LocationGate";
import { AddCourtDialog } from "./AddCourtDialog";
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
          onCountChange={setOsmCount}
          onError={setError}
          onDeleteLocal={handleDeleteLocal}
        />
      ) : (
        <div className="h-full w-full bg-gray-100" aria-hidden />
      )}
      <Header count={totalCount} status={status} errorMessage={error} />
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
