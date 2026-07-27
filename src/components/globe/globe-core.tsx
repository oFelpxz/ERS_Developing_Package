"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { PALETTE } from "./lib/scene-config";

/**
 * The planet body and its atmosphere.
 *
 * The body is deliberately near-black and *opaque*: it is what writes depth, so
 * routes and particles on the far hemisphere are occluded by the sphere instead
 * of showing through it. Everything readable on the globe is drawn on top of
 * this shell, never by it.
 */
export function GlobeCore() {
  const bodyMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uCore: { value: new THREE.Color("#03060f") },
          uRim: { value: new THREE.Color(PALETTE.landDim) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormalW;
          varying vec3 vPosW;
          void main() {
            vNormalW = normalize(mat3(modelMatrix) * normal);
            vec4 world = modelMatrix * vec4(position, 1.0);
            vPosW = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uCore;
          uniform vec3 uRim;
          varying vec3 vNormalW;
          varying vec3 vPosW;
          void main() {
            vec3 viewDir = normalize(cameraPosition - vPosW);
            // Grazing angles pick up a cold sheen so the sphere reads as a solid
            // volume without ever becoming a lit, realistic planet.
            float fres = pow(1.0 - clamp(dot(vNormalW, viewDir), 0.0, 1.0), 3.2);
            vec3 col = mix(uCore, uRim, fres * 0.55);
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    []
  );

  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(PALETTE.atmosphere) } },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
        vertexShader: /* glsl */ `
          varying vec3 vNormalW;
          varying vec3 vPosW;
          void main() {
            vNormalW = normalize(mat3(modelMatrix) * normal);
            vec4 world = modelMatrix * vec4(position, 1.0);
            vPosW = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          varying vec3 vNormalW;
          varying vec3 vPosW;
          void main() {
            vec3 viewDir = normalize(cameraPosition - vPosW);
            float facing = clamp(abs(dot(vNormalW, viewDir)), 0.0, 1.0);

            // Steep exponent so the halo collapses onto the limb. Anything that
            // creeps inward over the disc reads as a milky film across the
            // continents, which is exactly what this must not do.
            float fres = pow(1.0 - facing, 5.0);

            // Hard gate: kill everything that isn't within the rim band, so the
            // glow can never accumulate over the planet's face.
            fres *= smoothstep(0.42, 0.02, facing);

            gl_FragColor = vec4(uColor, fres * 0.16);
          }
        `,
      }),
    []
  );

  return (
    <group>
      <mesh material={bodyMaterial} renderOrder={0}>
        <sphereGeometry args={[0.995, 64, 48]} />
      </mesh>
      {/* 1.055, not 1.11: a tighter shell keeps the halo as a rim finish rather
          than a wide annulus that starts reading as a second sphere. */}
      <mesh material={atmosphereMaterial} renderOrder={4}>
        <sphereGeometry args={[1.055, 48, 32]} />
      </mesh>
    </group>
  );
}
