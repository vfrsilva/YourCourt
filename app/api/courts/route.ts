import { NextResponse } from "next/server";
import {
  MAX_BBOX_AREA_DEG,
  bboxArea,
  isValidBbox,
  parseBboxParams,
} from "@/lib/bbox";
import { fetchCourts } from "@/lib/overpass";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const bbox = parseBboxParams(url.searchParams);

  if (!bbox || !isValidBbox(bbox)) {
    return NextResponse.json(
      { error: "Invalid bounding box" },
      { status: 400 },
    );
  }

  if (bboxArea(bbox) > MAX_BBOX_AREA_DEG) {
    return NextResponse.json(
      { error: "Area too large, please zoom in" },
      { status: 413 },
    );
  }

  try {
    const courts = await fetchCourts(bbox);
    return NextResponse.json(
      { courts },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream error";
    return NextResponse.json(
      { error: "Failed to fetch courts", detail: message },
      { status: 502 },
    );
  }
}
