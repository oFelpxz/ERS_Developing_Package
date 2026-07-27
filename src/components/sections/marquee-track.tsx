"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Runs the client band only while it is on screen.
 *
 * The animation is a composited transform, but the track is ~4500px wide and was
 * running permanently — including while the section sat far outside the
 * viewport. On mobile that is continuous GPU work for something nobody can see,
 * competing with the rasterisation of whatever the user is actually scrolling
 * through. `:hover` alone never pauses it on touch devices.
 */
export function MarqueeTrack({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        el.style.animationPlayState = entry.isIntersecting ? "running" : "paused";
      },
      // Generous margin so it is already moving by the time it scrolls in.
      { rootMargin: "200px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Defaults to running, not paused. If the observer never fires — old engine,
  // some crawler, anything unexpected — the band keeps moving, which is the
  // current behaviour. Defaulting to paused would risk trading a performance
  // problem for frozen logos, which is the worse failure.
  return (
    <div ref={ref} className="marquee-track flex w-max">
      {children}
    </div>
  );
}
