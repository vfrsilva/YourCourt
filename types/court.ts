export type Coordinates = {
  lat: number;
  lng: number;
};

export type Bbox = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export type OsmType = "node" | "way" | "relation";

type CourtBase = {
  id: string;
  name?: string;
  surface?: string;
  coordinates: Coordinates;
};

export type OsmCourt = CourtBase & {
  source: "osm";
  osmType: OsmType;
  osmId: number;
  osmUrl: string;
};

export type LocalCourt = CourtBase & {
  source: "local";
  createdAt: number;
};

export type Court = OsmCourt | LocalCourt;
