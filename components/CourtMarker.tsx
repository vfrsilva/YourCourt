"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Court } from "@/types/court";

const OSM_SVG = `
<svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Basketball court">
  <circle cx="16" cy="16" r="13" fill="#ea580c" stroke="#1f2937" stroke-width="1.5"/>
  <path d="M3 16h26 M16 3v26 M6.6 6.6l18.8 18.8 M25.4 6.6l-18.8 18.8" stroke="#1f2937" stroke-width="1.25" fill="none" stroke-linecap="round"/>
</svg>
`;

const LOCAL_SVG = `
<svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="User added basketball court">
  <circle cx="16" cy="16" r="13" fill="#2563eb" stroke="#1f2937" stroke-width="1.5"/>
  <path d="M3 16h26 M16 3v26 M6.6 6.6l18.8 18.8 M25.4 6.6l-18.8 18.8" stroke="#1f2937" stroke-width="1.25" fill="none" stroke-linecap="round"/>
</svg>
`;

const osmIcon = L.divIcon({
  className: "yc-court-marker",
  html: OSM_SVG,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -14],
});

const localIcon = L.divIcon({
  className: "yc-court-marker yc-court-marker-local",
  html: LOCAL_SVG,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -14],
});

type Props = {
  court: Court;
  onDelete?: (id: string) => void;
};

export function CourtMarker({ court, onDelete }: Props) {
  const label = court.name ?? "Basketball court";
  const surface = court.surface ? `Surface, ${court.surface}` : null;
  const icon = court.source === "local" ? localIcon : osmIcon;

  return (
    <Marker
      position={[court.coordinates.lat, court.coordinates.lng]}
      icon={icon}
      keyboard
      title={label}
    >
      <Popup>
        <div className="min-w-[10rem] text-gray-900">
          <p className="text-sm font-semibold">{label}</p>
          {surface ? <p className="text-xs text-gray-700">{surface}</p> : null}
          {court.source === "osm" ? (
            <a
              href={court.osmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs font-medium text-orange-700 underline"
            >
              View on OpenStreetMap
            </a>
          ) : (
            <p className="mt-1 text-xs text-gray-500">Added by you</p>
          )}
          {court.source === "local" && onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(court.id)}
              className="mt-2 block text-xs font-medium text-red-700 underline"
            >
              Remove
            </button>
          ) : null}
        </div>
      </Popup>
    </Marker>
  );
}
