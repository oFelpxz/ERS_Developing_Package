"use client";

import { createElement, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Restricted to DOM tags on purpose. A bare `ElementType` also matches the
 * three.js elements that @react-three/fiber adds to the JSX namespace, which
 * makes the children prop resolve to `never`.
 */
type MotionTag =
  | "div"
  | "span"
  | "p"
  | "li"
  | "ul"
  | "ol"
  | "article"
  | "section"
  | "header"
  | "h1"
  | "h2"
  | "h3";

/**
 * One observer contract for every entrance in the site.
 * Fires once, then unobserves — reveals are not scroll-linked state.
 * Thresholds follow the skill's Scroll Reveal "Standard" tier (top 85%).
 */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Anything already on screen at mount is shown without waiting for the
    // observer. Hidden-until-observed content is a one-way door: if the callback
    // never arrives the element stays invisible while still occupying layout,
    // so the first paint should never depend on it.
    const rect = el.getBoundingClientRect();
    const alreadyOnScreen = rect.top < window.innerHeight && rect.bottom > 0;

    if (alreadyOnScreen || typeof IntersectionObserver === "undefined") {
      // Deferred so this isn't a synchronous setState in the effect body.
      queueMicrotask(() => setVisible(true));
      if (typeof IntersectionObserver === "undefined") return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setVisible(true);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, visible };
}

interface MotionProps {
  as?: MotionTag;
  className?: string;
  /** Stagger offset in ms. Keep ≤ 6 steps — the skill caps useful stagger at ~8 children. */
  delay?: number;
  children: ReactNode;
}

/**
 * createElement rather than a JSX tag: with a union of tags, TypeScript
 * intersects every possible ref type and nothing satisfies all of them at once.
 */
function motionNode(
  tag: MotionTag,
  ref: React.Ref<HTMLElement>,
  className: string,
  delay: number,
  children: ReactNode
) {
  return createElement(
    tag,
    {
      ref,
      className,
      style: delay ? { transitionDelay: `${delay}ms` } : undefined,
    },
    children
  );
}

/** Fade + rise. The default entrance. */
export function Reveal({ as = "div", className = "", delay = 0, children }: MotionProps) {
  const { ref, visible } = useInView<HTMLElement>();
  return motionNode(
    as,
    ref,
    `reveal${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`,
    delay,
    children
  );
}

/**
 * Mask wipe, for headings only.
 * Native replacement for GSAP SplitText (Club/paid plugin per the skill's motion
 * data). Text stays a single node, so screen readers and copy/paste are
 * unaffected. The wrapper clips; the inner element slides — the observed node is
 * never itself hidden, so it can always satisfy the observer.
 */
export function MaskReveal({ as = "div", className = "", delay = 0, children }: MotionProps) {
  const { ref, visible } = useInView<HTMLElement>();
  return motionNode(
    as,
    ref,
    `mask-reveal${className ? ` ${className}` : ""}`,
    0,
    createElement(
      "span",
      {
        className: `mask-reveal-inner${visible ? " is-visible" : ""}`,
        style: delay ? { transitionDelay: `${delay}ms` } : undefined,
      },
      children
    )
  );
}

/** Hairline that draws left-to-right. Separates editorial rows. */
export function RuleDraw({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  const { ref, visible } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`rule-h rule-draw${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    />
  );
}
