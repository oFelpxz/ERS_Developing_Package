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
 * A single IntersectionObserver shared by every reveal on the page.
 *
 * One observer per element meant ~60 instances all delivering callbacks onto the
 * same main thread. Sharing one keeps the callback work proportional to what
 * actually crossed the viewport, not to how many elements exist.
 *
 * The threshold is deliberately near-zero and there is no negative rootMargin:
 * the old `threshold: 0.15` plus `0px 0px -10% 0px` pushed the trigger point
 * well inside the viewport, so a fast scroll blew past an element before it was
 * ever asked to appear.
 */
type RevealCallback = () => void;

let sharedObserver: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, RevealCallback>();

function observeOnce(el: Element, cb: RevealCallback) {
  if (typeof IntersectionObserver === "undefined") {
    cb();
    return () => {};
  }

  sharedObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callbacks.get(entry.target)?.();
        callbacks.delete(entry.target);
        sharedObserver?.unobserve(entry.target);
      }
    },
    { threshold: 0.01, rootMargin: "0px 0px 5% 0px" }
  );

  callbacks.set(el, cb);
  sharedObserver.observe(el);

  return () => {
    callbacks.delete(el);
    sharedObserver?.unobserve(el);
  };
}

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

    if (alreadyOnScreen) {
      // Deferred so this isn't a synchronous setState in the effect body.
      queueMicrotask(() => setVisible(true));
      return;
    }

    return observeOnce(el, () => setVisible(true));
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
