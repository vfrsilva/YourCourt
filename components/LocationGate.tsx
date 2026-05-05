"use client";

import { useEffect, useState } from "react";
import type { Coordinates } from "@/types/court";

type Status = "pending" | "granted" | "denied" | "unsupported";

type Props = {
  onResolve: (coords: Coordinates | null) => void;
};

export function LocationGate({ onResolve }: Props) {
  const [status, setStatus] = useState<Status>("pending");

  function request() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
      onResolve(null);
      return;
    }
    setStatus("pending");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus("granted");
        onResolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setStatus("denied");
        onResolve(null);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  }

  useEffect(() => {
    request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "granted" || status === "pending") return null;

  const message =
    status === "denied"
      ? "Location access denied, showing Lisbon."
      : "Geolocation is not supported in this browser.";

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute left-1/2 top-16 z-[1001] flex -translate-x-1/2 items-center gap-3 rounded-lg bg-white px-4 py-2 shadow-lg ring-1 ring-black/5"
    >
      <span className="text-sm text-gray-800">{message}</span>
      <button
        type="button"
        onClick={request}
        className="rounded bg-orange-600 px-3 py-1 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
      >
        Use my location
      </button>
    </div>
  );
}
