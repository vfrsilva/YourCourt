"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import type {
  Coordinates,
  Court,
  LocalCourt,
  OsmCourt,
} from "@/types/court";
import { CourtMarker } from "./CourtMarker";

const LISBON: Coordinates = { lat: 38.7223, lng: -9.1393 };
const DEFAULT_ZOOM = 14;
const FOCUS_ZOOM = 16;
const DEBOUNCE_MS = 400;

type Props = {
  center: Coordinates | null;
  localCourts: LocalCourt[];
  focusCoords: Coordinates | null;
  onCountChange?: (count: number) => void;
  onError?: (message: string | null) => void;
  onDeleteLocal?: (id: string) => void;
};

function BoundsListener({
  onIdle,
}: {
  onIdle: (bounds: LatLngBounds) => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const map = useMapEvents({
    moveend() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => onIdle(map.getBounds()), DEBOUNCE_MS);
    },
  });

  useEffect(() => {
    onIdle(map.getBounds());
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}

function FocusController({ target }: { target: Coordinates | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    const zoom = Math.max(map.getZoom(), FOCUS_ZOOM);
    map.flyTo([target.lat, target.lng], zoom, { duration: 0.8 });
  }, [target, map]);
  return null;
}

export default function Map({
  center,
  localCourts,
  focusCoords,
  onCountChange,
  onError,
  onDeleteLocal,
}: Props) {
  const [osmCourts, setOsmCourts] = useState<OsmCourt[]>([]);
  const inflight = useRef<AbortController | null>(null);
  const initialCenter = center ?? LISBON;

  const handleIdle = useCallback(
    async (bounds: LatLngBounds) => {
      const params = new URLSearchParams({
        south: bounds.getSouth().toFixed(6),
        west: bounds.getWest().toFixed(6),
        north: bounds.getNorth().toFixed(6),
        east: bounds.getEast().toFixed(6),
      });
      inflight.current?.abort();
      const controller = new AbortController();
      inflight.current = controller;
      try {
        const res = await fetch(`/api/courts?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          onError?.(body?.error ?? `Request failed (${res.status})`);
          return;
        }
        const data = (await res.json()) as { courts: OsmCourt[] };
        setOsmCourts(data.courts);
        onCountChange?.(data.courts.length);
        onError?.(null);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        onError?.("Network error");
      }
    },
    [onCountChange, onError],
  );

  const allCourts = useMemo<Court[]>(
    () => [...osmCourts, ...localCourts],
    [osmCourts, localCourts],
  );

  const markers = useMemo(
    () =>
      allCourts.map((court) => (
        <CourtMarker
          key={court.id}
          court={court}
          onDelete={court.source === "local" ? onDeleteLocal : undefined}
        />
      )),
    [allCourts, onDeleteLocal],
  );

  return (
    <MapContainer
      center={[initialCenter.lat, initialCenter.lng]}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <BoundsListener onIdle={handleIdle} />
      <FocusController target={focusCoords} />
      {markers}
    </MapContainer>
  );
}
