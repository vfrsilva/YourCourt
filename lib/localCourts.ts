import type { Coordinates, LocalCourt } from "@/types/court";

const KEY = "yourcourt:local-courts:v1";

export function readLocalCourts(): LocalCourt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isLocalCourt);
  } catch {
    return [];
  }
}

export function writeLocalCourts(courts: LocalCourt[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(courts));
}

export function addLocalCourt(input: {
  name?: string;
  surface?: string;
  coordinates: Coordinates;
}): LocalCourt {
  const id = `local/${newId()}`;
  const court: LocalCourt = {
    id,
    source: "local",
    name: input.name?.trim() || undefined,
    surface: input.surface?.trim() || undefined,
    coordinates: input.coordinates,
    createdAt: Date.now(),
  };
  const all = readLocalCourts();
  all.push(court);
  writeLocalCourts(all);
  return court;
}

export function deleteLocalCourt(id: string): LocalCourt[] {
  const next = readLocalCourts().filter((c) => c.id !== id);
  writeLocalCourts(next);
  return next;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isLocalCourt(value: unknown): value is LocalCourt {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.source !== "local") return false;
  if (typeof v.id !== "string") return false;
  const c = v.coordinates as Record<string, unknown> | undefined;
  if (!c || typeof c.lat !== "number" || typeof c.lng !== "number") return false;
  return true;
}
