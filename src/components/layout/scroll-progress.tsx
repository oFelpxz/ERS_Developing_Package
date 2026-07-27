"use client";

import { useEffect, useState } from "react";

/**
 * Reading position as a hairline. Same weight as the column rules, so it reads
 * as part of the drawing sheet rather than a separate widget.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      // rAF-throttled: scroll fires far more often than we can paint.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        setProgress(max > 0 ? h.scrollTop / max : 0);
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
        className="h-full origin-left bg-brand-blue"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
