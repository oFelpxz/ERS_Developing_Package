"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Scene } from "./scene";
import type { SceneConfig } from "./lib/scene-config";

/**
 * Canvas host: owns the pointer/scroll signals and the render policy.
 *
 * Both signals are written into refs and read inside the frame loop, so moving
 * the mouse or scrolling never triggers a React render — the scene reads the
 * latest value and damps toward it.
 */
export function GlobeCanvas({
  config,
  reducedMotion,
  active,
  onReady,
}: {
  config: SceneConfig;
  reducedMotion: boolean;
  active: boolean;
  onReady: () => void;
}) {
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  useEffect(() => {
    if (reducedMotion || config.parallax === 0) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    // Listening on the window rather than the canvas keeps the canvas fully
    // pointer-events:none, so nav, language picker and CTAs stay clickable.
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reducedMotion, config.parallax]);

  useEffect(() => {
    if (reducedMotion) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        // Progress across the first viewport only — the globe belongs to the
        // hero and is done reacting by the time the next section arrives.
        scroll.current = Math.min(1, window.scrollY / Math.max(window.innerHeight, 1));
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return (
    <Canvas
      dpr={config.dpr}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, config.cameraZ], fov: config.fov, near: 0.1, far: 20 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        onReady();
      }}
      style={{ pointerEvents: "none" }}
    >
      {/* Keyed by tier: crossing a breakpoint rebuilds the scene at the right
          density and route count instead of stretching the previous one. */}
      <Scene
        key={`${config.surfacePoints}-${config.concurrentRoutes}`}
        config={config}
        reducedMotion={reducedMotion}
        pointer={pointer}
        scroll={scroll}
      />
    </Canvas>
  );
}
