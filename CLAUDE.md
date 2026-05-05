# CLAUDE.md, Hoops Finder

Project rules for Claude Code. Read this file at the start of every session and respect the constraints below.

## Purpose

A single page web app that shows nearby basketball courts on a map. The user opens the page, the app requests geolocation, and pins render for basketball courts within the visible map area. Clicking a pin shows basic court info. No accounts, no backend persistence, no analytics in v1.

## Tech stack

- Next.js 14 with App Router
- TypeScript, strict mode
- Tailwind CSS for all styling
- React Leaflet with OpenStreetMap tiles for the map
- Overpass API as the court data source, queried through a Next.js route handler
- Vercel for hosting

Do not introduce additional frameworks, UI libraries, or state management libraries without an explicit instruction. `useState` and React Context are sufficient at this scale.

## Project structure

```
app/
  page.tsx                 landing page, server component shell
  api/courts/route.ts      Overpass proxy with cache headers
  layout.tsx               root layout, metadata, fonts
components/
  Map.tsx                  client component, dynamically imported
  CourtMarker.tsx          custom marker and popup
  Header.tsx               app name and court count
  LocationGate.tsx         handles geolocation prompt and fallback
lib/
  overpass.ts              query builder and response normalizer
  bbox.ts                  small helpers for bounding boxes
types/
  court.ts                 Court, Coordinates, Bbox
```

One component per file. Keep components small and focused.

## Coding conventions

- TypeScript strict, no `any`, no non null assertions unless justified in a comment
- Server components by default, client components only when needed for interactivity (map, geolocation, popups)
- Tailwind utility classes only, no inline styles, no separate CSS files except the Leaflet stylesheet import
- Plain functions over classes
- Named exports preferred, default exports only for Next.js page and layout files
- US English in all UI copy, comments, and identifiers
- No em dashes in UI copy or comments, use commas or rephrase

## Data and APIs

- Public Overpass endpoint, `https://overpass-api.de/api/interpreter`
- Query target, OSM elements with `leisure=pitch` and `sport=basketball`, both nodes and ways
- All Overpass calls go through `app/api/courts/route.ts`, never call Overpass directly from the browser
- The route handler must:
  - Validate the bounding box parameters and reject queries that cover an unreasonably large area
  - Send a descriptive `User-Agent` header, Overpass requires this for fair use
  - Set `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` so Vercel caches results
- Normalize results to a `Court` type before returning to the client, do not leak raw OSM objects to the UI

## UX rules

- Map fills the viewport, header overlays the top with a translucent background
- Default center is Lisbon, Portugal, only used when geolocation is unavailable or denied
- Custom basketball marker, not the default Leaflet pin
- Popup content, court name if tagged (`name=*`), surface (`surface=*`), and a link to the OSM record
- Show a non blocking banner if geolocation is denied, with a one click "use my location" retry
- Refetch courts on map idle, debounce the handler by at least 400 ms

## Performance

- Lazy load the Map component with `dynamic(() => import('./Map'), { ssr: false })`
- Import Leaflet CSS in the client component, not in the root layout
- Cap the bounding box area in the route handler, return an error if exceeded so the UI can prompt the user to zoom in
- Avoid re rendering the map on every state change, memoize markers by court id

## Accessibility

- All interactive controls must be keyboard reachable
- Marker popups must have readable contrast, do not rely on color alone
- The geolocation prompt and fallback banner must use proper ARIA roles

## Deployment

- Hosting on Vercel, framework preset Next.js
- No environment variables required for v1
- `next/image` is fine for the basketball icon if used as a raster, otherwise inline SVG
- Verify the production build with `pnpm build` (or `npm run build`) before pushing to main

## What not to do

- Do not commit `.env*` files, secrets, or API keys
- Do not add Google Maps, Mapbox, or any paid map provider in v1
- Do not add user accounts, sign in, analytics, telemetry, or third party tracking
- Do not store user location on the server, geolocation stays in the browser
- Do not hardcode court data, all courts come from Overpass at runtime
- Do not introduce Redux, Zustand, Jotai, or similar state libraries
- Do not scaffold tests, Storybook, or i18n in v1, those are explicit follow ups
- Do not modify this file without confirming the change with the project owner

## Definition of done for v1

1. Production deploy on Vercel loads in under 3 seconds on a mid range mobile connection
2. Geolocation flow works on Chrome, Safari, and Firefox, both desktop and mobile
3. Pins render correctly for at least Lisbon, Porto, and Braga
4. Clicking a pin shows a popup with at least one piece of useful information
5. Lighthouse mobile score, Performance and Accessibility both above 90
