"use client";

import { useEffect, useRef } from "react";

/**
 * Reading position as a hairline. Same weight as the column rules, so it reads
 * as part of the drawing sheet rather than a separate widget.
 *
 * Written straight to the DOM through a ref: a setState here would put a React
 * render, reconciliation and style recalc on the main thread for every frame of
 * every scroll — main-thread time that the browser needs for rasterising the
 * content the user is scrolling toward.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let frame = 0;
    let last = -1;

    const onScroll = () => {
      // rAF-throttled: scroll fires far more often than we can paint.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const p = max > 0 ? h.scrollTop / max : 0;
        // Skip sub-pixel churn; scaleX below ~0.3% is invisible anyway.
        if (Math.abs(p - last) > 0.002) {
          bar.style.transform = `scaleX(${p})`;
          last = p;
        }
        frame = 0;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-px" aria-hidden="true">
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-brand-blue"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
