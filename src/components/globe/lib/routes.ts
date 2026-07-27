/**
 * The transport network, declared as data.
 *
 * Modes are never labelled or drawn with icons — they are read purely from
 * behaviour: air arcs high and fast, sea hugs the surface and moves slowly over
 * long coastal distances, road is short, low and frequent. Coordinates are
 * conceptual corridors, not commercial claims.
 */
export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface TransportRoute {
  id: string;
  mode: "air" | "sea" | "road";
  origin: GeoPoint;
  destination: GeoPoint;
  /** Multiplier on the mode's base pulse speed. */
  speed?: number;
  colorVariant?: "blue" | "violet";
}

/** Per-mode visual signature. Altitude is the arc's lift off the sphere. */
export const MODE_PROFILE = {
  air: { altitude: 0.34, baseSpeed: 0.42, width: 1.35, lineOpacity: 0.34 },
  sea: { altitude: 0.1, baseSpeed: 0.16, width: 1.1, lineOpacity: 0.26 },
  road: { altitude: 0.045, baseSpeed: 0.55, width: 1.0, lineOpacity: 0.22 },
} as const;

const P = {
  saopaulo: { lat: -23.55, lng: -46.63 },
  santos: { lat: -23.96, lng: -46.33 },
  nyc: { lat: 40.71, lng: -74.01 },
  toronto: { lat: 43.65, lng: -79.38 },
  cdmx: { lat: 19.43, lng: -99.13 },
  london: { lat: 51.51, lng: -0.13 },
  rotterdam: { lat: 51.92, lng: 4.48 },
  hamburg: { lat: 53.55, lng: 9.99 },
  madrid: { lat: 40.42, lng: -3.7 },
  milan: { lat: 45.46, lng: 9.19 },
  capetown: { lat: -33.92, lng: 18.42 },
  lagos: { lat: 6.45, lng: 3.39 },
  dubai: { lat: 25.2, lng: 55.27 },
  mumbai: { lat: 19.08, lng: 72.88 },
  singapore: { lat: 1.35, lng: 103.82 },
  shanghai: { lat: 31.23, lng: 121.47 },
  tokyo: { lat: 35.68, lng: 139.65 },
  sydney: { lat: -33.87, lng: 151.21 },
} as const;

/** Hubs are derived from the network, so a point can never drift off a route. */
export const HUBS: GeoPoint[] = Object.values(P);

/** Hubs that carry the most traffic get a slightly stronger marker. */
export const PRIMARY_HUBS: GeoPoint[] = [
  P.saopaulo, P.nyc, P.london, P.rotterdam, P.singapore, P.dubai,
];

/**
 * Twelve corridors, weighted toward the Atlantic / Europe / Africa face the
 * opening camera frames — a route the viewer cannot see does nothing for the
 * story. Kept small on purpose: a permanent web over the planet reads as
 * decoration, whereas a handful of legs reads as an operation.
 *
 * To add one: append an entry here. Geometry, scheduling and hub markers are all
 * derived from this array — nothing else needs touching.
 */
export const ROUTES: TransportRoute[] = [
  // Long-haul air — the high arcs that establish global scale
  { id: "a1", mode: "air", origin: P.saopaulo, destination: P.london, colorVariant: "blue" },
  { id: "a2", mode: "air", origin: P.nyc, destination: P.rotterdam, colorVariant: "blue" },
  { id: "a3", mode: "air", origin: P.mumbai, destination: P.london, colorVariant: "violet" },
  { id: "a4", mode: "air", origin: P.cdmx, destination: P.madrid, colorVariant: "blue" },
  { id: "a5", mode: "air", origin: P.dubai, destination: P.singapore, colorVariant: "blue" },

  // Sea corridors — slow, long, coastal
  { id: "s1", mode: "sea", origin: P.santos, destination: P.rotterdam, colorVariant: "blue" },
  { id: "s2", mode: "sea", origin: P.capetown, destination: P.lagos, colorVariant: "blue" },
  { id: "s3", mode: "sea", origin: P.hamburg, destination: P.nyc, colorVariant: "blue" },
  { id: "s4", mode: "sea", origin: P.singapore, destination: P.dubai, colorVariant: "violet" },

  // Road / regional — short, low, frequent
  { id: "r1", mode: "road", origin: P.rotterdam, destination: P.hamburg, colorVariant: "blue" },
  { id: "r2", mode: "road", origin: P.london, destination: P.rotterdam, colorVariant: "blue" },
  { id: "r3", mode: "road", origin: P.madrid, destination: P.milan, colorVariant: "blue" },
];
