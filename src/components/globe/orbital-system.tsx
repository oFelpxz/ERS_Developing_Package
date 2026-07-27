"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE } from "./lib/scene-config";

/**
 * Orbital rings — compositional, not logistical.
 *
 * Kept deliberately distinct from the transport arcs: perfect circles, no
 * pulses, no colour cycling, and an opacity low enough that they read as
 * structure echoing the page's grid rules rather than as traffic. They exist to
 * carry the eye around the sphere and tie it to the technical background.
 */
export function OrbitalSystem({ count, maskStrength }: { count: number; maskStrength: number }) {
  const group = useRef<THREE.Group>(null);

  const rings = useMemo(() => {
    const specs = [
      { radius: 1.19, tilt: 0.42, spin: 0.014, tint: 0 },
      { radius: 1.31, tilt: -0.68, spin: -0.009, tint: 1 },
      { radius: 1.45, tilt: 0.22, spin: 0.006, tint: 0 },
    ].slice(0, count);

    return specs.map((spec) => {
      const pts: number[] = [];
      const SEG = 128;
      for (let i = 0; i < SEG; i++) {
        const a = (i / SEG) * Math.PI * 2;
        const b = ((i + 1) / SEG) * Math.PI * 2;
        pts.push(Math.cos(a) * spec.radius, 0, Math.sin(a) * spec.radius);
        pts.push(Math.cos(b) * spec.radius, 0, Math.sin(b) * spec.radius);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));

      const m = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: {
            value: new THREE.Color(spec.tint ? PALETTE.routeViolet : PALETTE.routeBlue),
          },
          uMask: { value: maskStrength },
        },
        vertexShader: /* glsl */ `
          uniform float uMask;
          varying float vAlpha;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vec4 proj = projectionMatrix * viewMatrix * world;
            float ndcX = proj.x / proj.w;
            float lit = mix(1.0 - uMask, 1.0, smoothstep(-0.72, 0.18, ndcX));

            // Dim the half swinging behind the planet so the ring reads as 3D.
            float depth = smoothstep(-1.4, 0.9, world.z);

            // Additionally suppress the stretch that crosses the planet's disc.
            // Three additive rings sweeping over the face were laying a faint
            // blue wash across the continents — the rings belong around the
            // sphere, not on it.
            float radial = length(world.xy - vec2(0.0));
            float offDisc = smoothstep(0.9, 1.25, radial);
            vAlpha = lit * mix(0.12, 1.0, depth) * mix(0.15, 1.0, offDisc);
            gl_Position = proj;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          varying float vAlpha;
          void main() {
            gl_FragColor = vec4(uColor, vAlpha * 0.16);
          }
        `,
      });

      return { geometry: g, material: m, tilt: spec.tilt, spin: spec.spin };
    });
  }, [count, maskStrength]);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      child.rotation.y += rings[i].spin * delta * 12;
    });
  });

  return (
    <group ref={group}>
      {rings.map((ring, i) => (
        <lineSegments
          key={i}
          geometry={ring.geometry}
          material={ring.material}
          rotation={[ring.tilt, 0, ring.tilt * 0.6]}
          renderOrder={1}
        />
      ))}
    </group>
  );
}
