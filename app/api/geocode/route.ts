import { NextResponse } from "next/server";

const ENDPOINT = "https://nominatim.openstreetmap.org/search";
const USER_AGENT =
  "YourCourt/0.1 (+https://github.com/vfrsilva/YourCourt) basketball court finder";

export const runtime = "nodejs";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  if (!q || q.length < 3) {
    return NextResponse.json(
      { error: "Query too short" },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({
    q,
    format: "json",
    limit: "5",
    addressdetails: "0",
  });

  try {
    const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Nominatim returned ${res.status}` },
        { status: 502 },
      );
    }
    const data = (await res.json()) as NominatimResult[];
    const results = data
      .map((r) => ({
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        label: r.display_name,
      }))
      .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));

    return NextResponse.json(
      { results },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream error";
    return NextResponse.json(
      { error: "Geocoding failed", detail: message },
      { status: 502 },
    );
  }
}
