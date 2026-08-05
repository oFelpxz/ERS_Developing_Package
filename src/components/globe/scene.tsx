"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GlobeCore } from "./globe-core";
import { GeographicSurface } from "./geographic-surface";
import { TransportNetwork } from "./transport-network";
import { OrbitalSystem } from "./orbital-system";
import { AXIAL_TILT, BASE_ROTATION_Y, type SceneConfig } from "./lib/scene-config";

/** How far the legibility mask reaches — stronger where the headline is largest. */
const MASK_STRENGTH = 0.82;

interface SceneProps {
  config: SceneConfig;
  /** Normalised pointer, -1..1, already smoothed by the host. */
  pointer: React.RefObject<{ x: number; y: number }>;
  /** 0 at the top of the hero, 1 when it has scrolled away. */
  scroll: React.RefObject<number>;
}

export function Scene({ config, pointer, scroll }: SceneProps) {
  const globe = useRef<THREE.Group>(null);
  const rig = useRef<THREE.Group>(null);
  const spin = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    if (globe.current) {
      // Automatic rotation is deliberately near-imperceptible: the opening
      // framing on Europe/Africa has to survive for a long time.
      spin.current += dt * 0.018;
      globe.current.rotation.y = BASE_ROTATION_Y + spin.current;
    }

    if (rig.current) {
      const p = pointer.current ?? { x: 0, y: 0 };
      const s = scroll.current ?? 0;

      // Parallax is applied to the rig, never to the globe's own spin, so the
      // pointer nudges the camera's sense of depth without dragging the planet.
      const targetX = config.offset[0] + p.x * config.parallax * 0.06;
      const targetY = config.offset[1] + p.y * config.parallax * 0.04 - s * 0.28;
      const targetZ = -s * 0.55;

      rig.current.position.x = THREE.MathUtils.damp(rig.current.position.x, targetX, 3, dt);
      rig.current.position.y = THREE.MathUtils.damp(rig.current.position.y, targetY, 3, dt);
      rig.current.position.z = THREE.MathUtils.damp(rig.current.position.z, targetZ, 3, dt);

      const targetTilt = AXIAL_TILT + p.y * config.parallax * 0.05;
      rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, targetTilt, 3, dt);
      rig.current.rotation.z = THREE.MathUtils.damp(
        rig.current.rotation.z,
        AXIAL_TILT * 0.5 - p.x * config.parallax * 0.02,
        3,
        dt
      );
    }

    // The planet pulls back as the hero leaves, handing off to the section below
    // instead of cutting. Camera comes off the frame state, not useThree — it is
    // imperative scene state and must not be mutated from a hook's return value.
    const s = scroll.current ?? 0;
    const cam = state.camera;
    cam.position.z = THREE.MathUtils.damp(cam.position.z, config.cameraZ + s * 0.4, 3, dt);
  });

  return (
    <group ref={rig} position={[config.offset[0], config.offset[1], 0]} scale={config.scale}>
      <group ref={globe}>
        <GlobeCore />
        <GeographicSurface
          count={config.surfacePoints}
          pointSize={config.pointSize}
          maskStrength={MASK_STRENGTH}
        />
        <TransportNetwork concurrent={config.concurrentRoutes} maskStrength={MASK_STRENGTH} />
      </group>
      <OrbitalSystem count={config.orbitals} maskStrength={MASK_STRENGTH} />
    </group>
  );
}
