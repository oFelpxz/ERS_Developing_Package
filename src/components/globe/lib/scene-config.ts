/**
 * Responsive tiers for the scene itself — not CSS scaling.
 *
 * The globe has to stay monumental and right-anchored on a 27" display and
 * still read as the same object on a phone, so camera, offset, particle density
 * and how many routes run at once are all tuned per tier rather than letting one
 * layout stretch.
 */
export type Tier = "mobile" | "tablet" | "laptop" | "desktop";

export interface SceneConfig {
  /** Camera distance from origin. Lower = closer/more dramatic curvature. */
  cameraZ: number;
  fov: number;
  /** Globe centre in world units. Positive x pushes the planet right, off-canvas. */
  offset: [number, number];
  scale: number;
  /** Surface particle budget. */
  surfacePoints: number;
  pointSize: number;
  /** How many routes may be lit simultaneously. */
  concurrentRoutes: number;
  orbitals: number;
  /** Pointer parallax strength; 0 disables it entirely. */
  parallax: number;
  dpr: [number, number];
}

const CONFIG: Record<Tier, SceneConfig> = {
  // Text owns the top; the planet rises from the bottom edge, cropped at both
  // sides. Closer camera so the curvature still reads at this size.
  mobile: {
    cameraZ: 3.1,
    fov: 42,
    offset: [0.28, -0.85],
    scale: 1.02,
    surfacePoints: 4200,
    pointSize: 0.0150,
    concurrentRoutes: 2,
    orbitals: 1,
    parallax: 0,
    dpr: [1, 1.6],
  },
  tablet: {
    cameraZ: 3.3,
    fov: 40,
    offset: [0.72, -0.30],
    scale: 1.00,
    surfacePoints: 5400,
    pointSize: 0.0138,
    concurrentRoutes: 2,
    orbitals: 2,
    parallax: 0.35,
    dpr: [1, 1.75],
  },
  laptop: {
    cameraZ: 3.35,
    fov: 36,
    offset: [0.82, -0.16],
    scale: 1.06,
    surfacePoints: 7000,
    pointSize: 0.0124,
    concurrentRoutes: 3,
    orbitals: 2,
    parallax: 0.5,
    dpr: [1, 1.85],
  },
  // Monumental: the sphere overruns the right and bottom edges so it reads as
  // an object larger than the viewport.
  desktop: {
    cameraZ: 3.25,
    fov: 34,
    offset: [0.88, -0.14],
    scale: 1.12,
    surfacePoints: 8600,
    pointSize: 0.0112,
    concurrentRoutes: 4,
    orbitals: 3,
    parallax: 0.6,
    dpr: [1, 2],
  },
};

export function tierFor(width: number): Tier {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  if (width < 1536) return "laptop";
  return "desktop";
}

export function configFor(tier: Tier): SceneConfig {
  return CONFIG[tier];
}

/** Brings roughly 15°E — Europe over Africa — around to face the camera. */
export const BASE_ROTATION_Y = -1.83;
/** Slight axial lean so the planet never reads as a flat upright circle. */
export const AXIAL_TILT = -0.18;

export const PALETTE = {
  /** Land facing the camera. Brighter than the routes' base so geography reads first. */
  land: "#6f9bff",
  /** Land wrapping around the curve — lifted off near-black so it stays legible. */
  landDim: "#2f5aa8",
  atmosphere: "#1e5bff",
  /** Routes sit above the land in luminance: they are the narrative layer. */
  routeBlue: "#8fb4ff",
  routeViolet: "#a688ff",
  hub: "#ffffff",
} as const;
