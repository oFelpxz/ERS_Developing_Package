import * as THREE from "three";

/**
 * Single source of truth for geography → 3D.
 * Every hub, route endpoint and surface particle goes through this, so nothing
 * is ever hand-placed with arbitrary world-space coordinates.
 *
 * Longitude 0 faces +Z at rotation 0; the scene then rotates the globe group to
 * frame the Atlantic-facing hemisphere (Europe + Africa) toward the camera.
 */
export function latLngToVec3(lat: number, lng: number, radius = 1): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Great-circle arc between two surface points, bowed outward.
 *
 * The lift scales with angular distance so a regional hop stays close to the
 * surface while an intercontinental leg rises — that difference is what reads
 * as road vs air without drawing a single vehicle icon.
 */
export function arcPoints(
  from: THREE.Vector3,
  to: THREE.Vector3,
  altitude: number,
  segments: number
): THREE.Vector3[] {
  const angle = from.angleTo(to);
  const lift = altitude * Math.sin(Math.min(angle, Math.PI) / 2);
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Slerp keeps the path on the sphere; the sine term lifts it off cleanly at
    // both ends so arcs never appear to punch through the planet.
    const p = new THREE.Vector3().copy(from).lerp(to, t);
    if (p.lengthSq() < 1e-8) p.copy(from);
    p.normalize().multiplyScalar(1 + lift * Math.sin(Math.PI * t));
    points.push(p);
  }
  return points;
}

/** Deterministic PRNG so particle scatter is identical on server and client. */
export function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
