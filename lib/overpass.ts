import type { Bbox, OsmCourt, OsmType } from "@/types/court";

const ENDPOINT = "https://overpass-api.de/api/interpreter";
const USER_AGENT =
  "YourCourt/0.1 (+https://github.com/vfrsilva/YourCourt) basketball court finder";

type OverpassElement = {
  type: OsmType;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements: OverpassElement[];
};

export function buildQuery(bbox: Bbox): string {
  const { south, west, north, east } = bbox;
  const filter = `["leisure"="pitch"]["sport"="basketball"]`;
  return [
    "[out:json][timeout:25];",
    "(",
    `  node${filter}(${south},${west},${north},${east});`,
    `  way${filter}(${south},${west},${north},${east});`,
    ");",
    "out center tags;",
  ].join("\n");
}

export async function fetchCourts(bbox: Bbox): Promise<OsmCourt[]> {
  const query = buildQuery(bbox);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
    body: `data=${encodeURIComponent(query)}`,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Overpass returned ${res.status}`);
  }

  const data = (await res.json()) as OverpassResponse;
  const courts: OsmCourt[] = [];
  for (const element of data.elements) {
    const court = normalize(element);
    if (court) courts.push(court);
  }
  return courts;
}

function normalize(element: OverpassElement): OsmCourt | null {
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  return {
    id: `${element.type}/${element.id}`,
    source: "osm",
    name: element.tags?.name,
    surface: element.tags?.surface,
    coordinates: { lat, lng },
    osmType: element.type,
    osmId: element.id,
    osmUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
  };
}
