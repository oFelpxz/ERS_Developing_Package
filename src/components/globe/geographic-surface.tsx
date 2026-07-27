"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { LANDMASSES, type Ring } from "./lib/landmasses";
import { latLngToVec3, seededRandom } from "./lib/geo";
import { PALETTE } from "./lib/scene-config";

function pointInRing(lat: number, lng: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [yi, xi] = ring[i];
    const [yj, xj] = ring[j];
    if (xi > lng !== xj > lng) {
      const t = (lng - xi) / (xj - xi);
      if (lat < yi + t * (yj - yi)) inside = !inside;
    }
  }
  return inside;
}

/**
 * Continents as scattered surface modules.
 *
 * Points are rejection-sampled inside the authored landmass rings using an
 * equal-area distribution (asin on the latitude term), so the density stays even
 * instead of bunching at the poles the way a naive lat/lng grid does. The scatter
 * is seeded, so server and client agree and nothing pops on hydration.
 */
export function GeographicSurface({
  count,
  pointSize,
  maskStrength,
}: {
  count: number;
  pointSize: number;
  maskStrength: number;
}) {
  const geometry = useMemo(() => {
    const rand = seededRandom(20260725);
    const positions: number[] = [];
    const scales: number[] = [];

    let guard = 0;
    while (positions.length / 3 < count && guard < count * 60) {
      guard++;
      const lat = (Math.asin(rand() * 2 - 1) * 180) / Math.PI;
      const lng = rand() * 360 - 180;
      if (!LANDMASSES.some((ring) => pointInRing(lat, lng, ring))) continue;

      const v = latLngToVec3(lat, lng, 1.002);
      positions.push(v.x, v.y, v.z);
      // Tighter spread than before: the previous range produced scattered
      // oversized dots that read as noise instead of landmass. Most modules now
      // sit close to a common size, with only a small minority stepping up.
      scales.push(rand() < 0.05 ? 1.5 + rand() * 0.5 : 0.8 + rand() * 0.3);
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("aScale", new THREE.Float32BufferAttribute(scales, 1));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uSize: { value: pointSize },
          uColor: { value: new THREE.Color(PALETTE.land) },
          uColorDim: { value: new THREE.Color(PALETTE.landDim) },
          uMask: { value: maskStrength },
        },
        vertexShader: /* glsl */ `
          attribute float aScale;
          uniform float uSize;
          uniform float uMask;
          varying float vAlpha;
          varying float vFacing;

          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vec4 mv = viewMatrix * world;
            vec4 proj = projectionMatrix * mv;

            // Facing drives the whole hierarchy: land turned toward the camera
            // reads as cold blue, land wrapping around the curve falls away to
            // near-black so the sphere never looks like a flat printed map.
            vec3 nW = normalize(mat3(modelMatrix) * normalize(position));
            vec3 viewDir = normalize(cameraPosition - world.xyz);
            float facing = dot(nW, viewDir);
            float front = smoothstep(-0.02, 0.38, facing);

            // Extra push on the dead-front band, so the hemisphere actually
            // framed by the camera carries the strongest contrast.
            vFacing = smoothstep(0.25, 0.85, facing);

            // Legibility mask, in screen space: the planet walks into the light
            // from the right, leaving the headline side quiet. Doing this in the
            // shader avoids a visible dark rectangle over the canvas.
            float ndcX = proj.x / proj.w;
            float lit = mix(1.0 - uMask, 1.0, smoothstep(-0.72, 0.18, ndcX));

            vAlpha = front * lit;
            gl_PointSize = uSize * aScale * (900.0 / max(-mv.z, 0.001));
            gl_Position = proj;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform vec3 uColorDim;
          varying float vAlpha;
          varying float vFacing;
          void main() {
            // Soft round module; square points would read as compression noise.
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float falloff = smoothstep(0.5, 0.12, d);

            // Two-tone land: dim navy around the curve, cold blue on the face.
            // Lifted overall — the continents are the map, they should be plainly
            // readable rather than an atmospheric suggestion.
            vec3 col = mix(uColorDim, uColor, vFacing);
            gl_FragColor = vec4(col, vAlpha * falloff * 1.35);
          }
        `,
      }),
    [pointSize, maskStrength]
  );

  return <points geometry={geometry} material={material} renderOrder={1} />;
}
