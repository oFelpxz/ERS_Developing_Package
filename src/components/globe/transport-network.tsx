"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { arcPoints, latLngToVec3 } from "./lib/geo";
import { HUBS, MODE_PROFILE, PRIMARY_HUBS, ROUTES } from "./lib/routes";
import { PALETTE } from "./lib/scene-config";

const MAX_ROUTES = 24;
const SEGMENTS = 46;

/**
 * The logistics network: arcs, travelling pulses and the hubs they connect.
 *
 * All routes live in one merged LineSegments geometry — a single draw call for
 * the whole network. Which route is lit, and how far its pulse has travelled,
 * is written into per-vertex attributes each frame; the geometry itself is
 * built once and never rebuilt.
 */
export function TransportNetwork({
  concurrent,
  maskStrength,
  reducedMotion,
}: {
  concurrent: number;
  maskStrength: number;
  reducedMotion: boolean;
}) {
  const hubExcitation = useRef(new Float32Array(HUBS.length));

  /** Frame-loop scratch space, allocated once. */
  const scratch = useRef({
    progress: new Float32Array(ROUTES.length),
    active: new Float32Array(ROUTES.length),
    /** Last values uploaded to the GPU, so unchanged frames skip the upload. */
    lastProgress: new Float32Array(ROUTES.length),
    lastActive: new Float32Array(ROUTES.length),
  });

  /** Lane scheduler: one active route per lane guarantees the concurrency cap. */
  const lanes = useRef(
    Array.from({ length: Math.max(1, concurrent) }, (_, k) => ({
      members: ROUTES.map((_, i) => i).filter((i) => i % Math.max(1, concurrent) === k),
      cursor: 0,
      t: -k * 0.9, // stagger lane starts so they never fire in unison
    }))
  );

  /**
   * Built once into a ref rather than useMemo: these objects are mutated every
   * frame (uniforms, attributes), which is the R3F pattern but is exactly what
   * the compiler's immutability rule forbids on memoised values. The scene is
   * remounted by key when the breakpoint tier changes, so init-once is correct.
   */
  const build = () => {
    const positions: number[] = [];
    const ts: number[] = [];
    const tints: number[] = [];
    // Vertex span of each route, so the frame loop can write its progress
    // straight into the buffer without touching the others.
    const ranges: { start: number; count: number }[] = [];
    const meta: { origin: number; destination: number; duration: number }[] = [];

    const hubKey = (lat: number, lng: number) =>
      HUBS.findIndex((h) => Math.abs(h.lat - lat) < 0.01 && Math.abs(h.lng - lng) < 0.01);

    ROUTES.slice(0, MAX_ROUTES).forEach((route) => {
      const profile = MODE_PROFILE[route.mode];
      const startVertex = positions.length / 3;
      const from = latLngToVec3(route.origin.lat, route.origin.lng, 1.004);
      const to = latLngToVec3(route.destination.lat, route.destination.lng, 1.004);
      const pts = arcPoints(from, to, profile.altitude, SEGMENTS);

      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
        ts.push(i / SEGMENTS, (i + 1) / SEGMENTS);
        const tint = route.colorVariant === "violet" ? 1 : 0;
        tints.push(tint, tint);
      }

      ranges.push({ start: startVertex, count: positions.length / 3 - startVertex });

      meta.push({
        origin: hubKey(route.origin.lat, route.origin.lng),
        destination: hubKey(route.destination.lat, route.destination.lng),
        duration: 1 / (profile.baseSpeed * (route.speed ?? 1)),
      });
    });

    const vertexCount = positions.length / 3;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("aT", new THREE.Float32BufferAttribute(ts, 1));
    g.setAttribute("aTint", new THREE.Float32BufferAttribute(tints, 1));
    // Per-vertex animation state, rather than uniform arrays indexed by a route
    // id. Both compile, but this keeps the shader free of dynamic indexing and
    // costs nothing: the whole network is ~1.1k vertices.
    g.setAttribute("aProgress", new THREE.BufferAttribute(new Float32Array(vertexCount), 1));
    g.setAttribute("aActive", new THREE.BufferAttribute(new Float32Array(vertexCount), 1));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uBlue: { value: new THREE.Color(PALETTE.routeBlue) },
        uViolet: { value: new THREE.Color(PALETTE.routeViolet) },
        uMask: { value: maskStrength },
      },
      vertexShader: /* glsl */ `
        attribute float aT;
        attribute float aTint;
        attribute float aProgress;
        attribute float aActive;
        uniform float uMask;
        varying float vAlpha;
        varying float vTint;
        varying float vHead;

        void main() {
          float progress = aProgress;
          // NB: nao renomear para "active" — e palavra reservada no GLSL ES e
          // faz o vertex shader falhar em drivers mais estritos.
          float flow = aActive;
          vTint = aTint;

          vec4 world = modelMatrix * vec4(position, 1.0);
          vec4 proj = projectionMatrix * viewMatrix * world;

          // Hide anything on the far side: the sphere already occludes via depth,
          // this stops arcs that lift above the limb from reading through it.
          vec3 nW = normalize(mat3(modelMatrix) * normalize(position));
          vec3 viewDir = normalize(cameraPosition - world.xyz);
          float front = smoothstep(-0.02, 0.3, dot(nW, viewDir));

          float ndcX = proj.x / proj.w;
          float lit = mix(1.0 - uMask, 1.0, smoothstep(-0.72, 0.18, ndcX));

          // Progressive draw: the arc only exists behind the pulse, so the eye
          // reads origin → travel → destination instead of a line that was
          // already there with a dot sliding along it.
          float drawn = step(aT, progress);

          // Short trail, not a comet — a bright head with a brief falloff.
          float trail = smoothstep(progress - 0.2, progress, aT) * drawn;
          vHead = smoothstep(progress - 0.04, progress, aT) * drawn;

          // Every corridor keeps a permanent thread. Routes that only existed
          // while firing left the planet bare most of the time; the network has
          // to read as standing infrastructure, with traffic moving over it.
          float corridor = 0.17;
          // The leg currently running lifts well clear of that baseline.
          float running = 0.5 * drawn * flow;

          vAlpha = (corridor + running + trail * 1.35 * flow) * front * lit;
          gl_Position = proj;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uBlue;
        uniform vec3 uViolet;
        varying float vAlpha;
        varying float vTint;
        varying float vHead;
        void main() {
          vec3 col = mix(uBlue, uViolet, vTint);
          // The head goes to cold white — the one place in the scene that does.
          col = mix(col, vec3(1.0), vHead * 0.85);
          gl_FragColor = vec4(col, vAlpha);
        }
      `,
    });

    // ── Hubs ───────────────────────────────────────────────────────────────
    const hubPos: number[] = [];
    const hubWeight: number[] = [];
    HUBS.forEach((h) => {
      const v = latLngToVec3(h.lat, h.lng, 1.006);
      hubPos.push(v.x, v.y, v.z);
      hubWeight.push(PRIMARY_HUBS.includes(h) ? 1 : 0.55);
    });

    const hg = new THREE.BufferGeometry();
    hg.setAttribute("position", new THREE.Float32BufferAttribute(hubPos, 3));
    hg.setAttribute("aWeight", new THREE.Float32BufferAttribute(hubWeight, 1));
    hg.setAttribute("aExcite", new THREE.BufferAttribute(new Float32Array(HUBS.length), 1));

    const hm = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color(PALETTE.hub) },
        uAccent: { value: new THREE.Color(PALETTE.routeBlue) },
        uMask: { value: maskStrength },
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        attribute float aWeight;
        attribute float aExcite;
        uniform float uMask;
        uniform float uTime;
        varying float vAlpha;
        varying float vExcite;

        void main() {
          vec4 world = modelMatrix * vec4(position, 1.0);
          vec4 mv = viewMatrix * world;
          vec4 proj = projectionMatrix * mv;

          vec3 nW = normalize(mat3(modelMatrix) * normalize(position));
          vec3 viewDir = normalize(cameraPosition - world.xyz);
          float front = smoothstep(0.02, 0.35, dot(nW, viewDir));

          float ndcX = proj.x / proj.w;
          float lit = mix(1.0 - uMask, 1.0, smoothstep(-0.72, 0.18, ndcX));

          // Idle hubs stay quiet — small, cold, barely breathing. All the
          // attention belongs to whichever hub is currently sending or receiving.
          float idle = 0.6 + 0.4 * sin(uTime * 0.9 + aWeight * 9.0);
          vExcite = aExcite;
          vAlpha = front * lit * (0.22 + 0.16 * idle * aWeight + aExcite * 1.0);

          // Point size is held nearly constant so the arrival ring, not a
          // swelling blob, carries the reaction.
          gl_PointSize = (5.0 + aWeight * 4.0 + aExcite * 4.5) * (260.0 / max(-mv.z, 0.001)) * 0.012;
          gl_Position = proj;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform vec3 uAccent;
        varying float vAlpha;
        varying float vExcite;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;

          // Tight core dot — the hub itself.
          float core = smoothstep(0.22, 0.0, d);

          // Arrival ring: expands outward as the excitation decays, then is gone.
          // Drawn inside the point sprite so it stays welded to the surface and
          // follows the planet's rotation instead of floating like a radar sweep.
          float e = clamp(vExcite, 0.0, 1.0);
          float radius = mix(0.1, 0.46, 1.0 - e);
          float ring = smoothstep(0.06, 0.0, abs(d - radius)) * e * step(0.02, e);

          vec3 col = mix(uAccent, uColor, core * 0.75 + e * 0.25);
          gl_FragColor = vec4(col, vAlpha * core + ring * 0.85);
        }
      `,
    });

    return { geometry: g, material: mat, hubGeometry: hg, hubMaterial: hm, routeMeta: meta, ranges };
  };

  // Lazy useState: constructed exactly once, stable across renders, and safe to
  // read while rendering — unlike a ref — while still being a plain mutable
  // object we can drive from the frame loop.
  const [store] = useState(build);
  const { geometry, material, hubGeometry, hubMaterial, routeMeta, ranges } = store;

  /**
   * Uniforms and attribute buffers are GPU state, not render state — they are
   * written every frame and never affect React's output. Reaching them through
   * refs inside the frame loop keeps that mutation out of the render path,
   * which is both what the compiler expects and how R3F is meant to be driven.
   */
  const gpu = useRef<{
    geometry: THREE.BufferGeometry;
    hubMaterial: THREE.ShaderMaterial;
    hubGeometry: THREE.BufferGeometry;
  } | null>(null);

  useEffect(() => {
    gpu.current = { geometry, hubMaterial, hubGeometry };
  }, [geometry, hubMaterial, hubGeometry]);

  // Release GPU memory when the scene unmounts (tier change, navigation away).
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      hubGeometry.dispose();
      hubMaterial.dispose();
    },
    [geometry, material, hubGeometry, hubMaterial]
  );

  useFrame((state, delta) => {
    const g = gpu.current;
    if (!g) return;

    const dt = Math.min(delta, 0.05); // clamp so a stalled tab can't jump the cycle
    const progressAttr = g.geometry.getAttribute("aProgress") as THREE.BufferAttribute;
    const activeAttr = g.geometry.getAttribute("aActive") as THREE.BufferAttribute;
    const progressBuf = progressAttr.array as Float32Array;
    const activeBuf = activeAttr.array as Float32Array;
    const excite = hubExcitation.current;

    // Per-route values fan out across that route's vertex span. Reused across
    // frames — allocating two arrays per frame was ~120 short-lived objects a
    // second, and GC pauses on a mobile CPU land straight in the scroll budget.
    const progress = scratch.current.progress;
    const active = scratch.current.active;
    progress.fill(0);
    active.fill(0);

    g.hubMaterial.uniforms.uTime.value = state.clock.elapsedTime;

    // Excitation decays continuously; route events top it back up.
    for (let i = 0; i < excite.length; i++) excite[i] = Math.max(0, excite[i] - dt * 1.6);

    if (reducedMotion) {
      // Static composition: a few corridors held fully drawn, nothing moving.
      for (let i = 0; i < routeMeta.length; i++) {
        const held = i < concurrent;
        active[i] = held ? 1 : 0;
        progress[i] = held ? 1 : 0;
      }
    } else {
      for (const lane of lanes.current) {
        if (lane.members.length === 0) continue;
        const routeIndex = lane.members[lane.cursor % lane.members.length];
        const meta = routeMeta[routeIndex];
        if (!meta) continue;

        lane.t += dt;
        const travel = meta.duration;
        const fade = 0.9; // afterglow: the drawn line lingers, then dims
        // Dwell before the lane picks its next route. Without it the lanes fire
        // back-to-back and the network reads as busy rather than operating.
        const hold = travel + fade + 1.4;

        if (lane.t < 0) {
          active[routeIndex] = 0;
          continue;
        }

        const p = lane.t / travel;
        if (p <= 1) {
          if (p < 0.02) excite[meta.origin] = Math.max(excite[meta.origin], 1);
          progress[routeIndex] = p;
          active[routeIndex] = Math.min(1, lane.t / 0.35);
        } else {
          // Arrival flare, then fade the arc out.
          if (lane.t - dt <= travel) excite[meta.destination] = Math.max(excite[meta.destination], 1.2);
          progress[routeIndex] = 1;
          active[routeIndex] = Math.max(0, 1 - (lane.t - travel) / fade);
        }

        if (lane.t >= hold) {
          active[routeIndex] = 0;
          progress[routeIndex] = 0;
          lane.cursor++;
          lane.t = 0;
        }
      }
    }

    // Only touch the buffers when a route actually moved. `needsUpdate = true`
    // re-uploads the whole attribute to the GPU; doing it unconditionally meant
    // two full uploads every frame even while the network sat idle.
    const { lastProgress, lastActive } = scratch.current;
    let dirty = false;
    for (let r = 0; r < ranges.length; r++) {
      if (progress[r] === lastProgress[r] && active[r] === lastActive[r]) continue;
      const { start, count } = ranges[r];
      progressBuf.fill(progress[r], start, start + count);
      activeBuf.fill(active[r], start, start + count);
      lastProgress[r] = progress[r];
      lastActive[r] = active[r];
      dirty = true;
    }
    if (dirty) {
      progressAttr.needsUpdate = true;
      activeAttr.needsUpdate = true;
    }

    const attr = g.hubGeometry.getAttribute("aExcite") as THREE.BufferAttribute;
    (attr.array as Float32Array).set(excite);
    attr.needsUpdate = true;
  });

  return (
    <group>
      <lineSegments geometry={geometry} material={material} renderOrder={2} />
      <points geometry={hubGeometry} material={hubMaterial} renderOrder={3} />
    </group>
  );
}
