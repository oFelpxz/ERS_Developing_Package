"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { configFor, tierFor, type Tier } from "./lib/scene-config";

/**
 * Hero globe — the WebGL scene is code-split and loaded after paint, so the
 * headline and CTAs never wait on three.js. A static fallback holds the exact
 * same position and palette underneath, and the canvas cross-fades over it.
 */
const GlobeCanvas = dynamic(() => import("./globe-canvas").then((m) => m.GlobeCanvas), {
  ssr: false,
});

export function LogisticsGlobe({ className = "" }: { className?: string }) {
  const [tier, setTier] = useState<Tier | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState(false);
  /** Set after the cross-fade finishes, so the fallback can leave the DOM. */
  const [settled, setSettled] = useState(false);
  const [active, setActive] = useState(true);
  const hostRef = useRef<HTMLDivElement>(null);

  // Tier is resolved from the viewport, then re-resolved on resize. Scene
  // config (camera, density, route count) keys off this — not CSS scaling.
  //
  // `?noglobe=1` leaves the tier null, so the WebGL scene is never mounted and
  // the hero keeps the static fallback. A diagnostic switch: it lets the same
  // deploy be A/B tested on a real device, which is the only way to confirm
  // whether the canvas is what stalls painting on iOS.
  useEffect(() => {
    const disabled = new URLSearchParams(window.location.search).get("noglobe") === "1";
    const resolve = () => setTier(disabled ? null : tierFor(window.innerWidth));
    resolve();

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => setReducedMotion(motion.matches);
    applyMotion();

    window.addEventListener("resize", resolve, { passive: true });
    motion.addEventListener("change", applyMotion);
    return () => {
      window.removeEventListener("resize", resolve);
      motion.removeEventListener("change", applyMotion);
    };
  }, []);

  // Stop rendering entirely when the hero is off screen or the tab is hidden —
  // an animating canvas nobody can see is pure battery drain.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(host);

    const onVisibility = () => setActive(!document.hidden && !!hostRef.current);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Retire the fallback only after the cross-fade has actually run.
  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => setSettled(true), 1100);
    return () => window.clearTimeout(id);
  }, [ready]);

  const config = tier ? configFor(tier) : null;

  return (
    // Positioning belongs to the caller: hardcoding `relative` here collided
    // with the hero's `absolute inset-0` and collapsed the host to zero height,
    // which left the canvas stuck at its 300x150 default.
    <div ref={hostRef} className={`pointer-events-none ${className}`} aria-hidden="true">
      {/* Static fallback: same silhouette, same palette, same place. Drawn with
          gradients so there is no image request competing with the hero.
          Unmounted once the scene is up — leaving it at opacity 0 kept an
          additive-looking wash stacked under the canvas. */}
      {!settled && (
        <div
          className="globe-fallback absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: ready ? 0 : 1 }}
        />
      )}

      {config && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: ready ? 1 : 0 }}
        >
          <GlobeCanvas
            config={config}
            reducedMotion={reducedMotion}
            active={active}
            onReady={() => setReady(true)}
          />
        </div>
      )}
    </div>
  );
}
