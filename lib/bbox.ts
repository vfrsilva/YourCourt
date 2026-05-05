import type { Bbox } from "@/types/court";

export const MAX_BBOX_AREA_DEG = 2;

export function bboxArea(bbox: Bbox): number {
  return (bbox.north - bbox.south) * (bbox.east - bbox.west);
}

export function isValidBbox(bbox: Bbox): boolean {
  const { south, west, north, east } = bbox;
  const finite = [south, west, north, east].every(Number.isFinite);
  if (!finite) return false;
  if (south < -90 || north > 90 || south >= north) return false;
  if (west < -180 || east > 180 || west >= east) return false;
  return true;
}

export function parseBboxParams(params: URLSearchParams): Bbox | null {
  const south = Number(params.get("south"));
  const west = Number(params.get("west"));
  const north = Number(params.get("north"));
  const east = Number(params.get("east"));
  if (![south, west, north, east].every(Number.isFinite)) return null;
  return { south, west, north, east };
}
