import { MaskReveal, Reveal, RuleDraw } from "@/components/reveal";
import { LogisticsGlobe } from "@/components/globe/logistics-globe";
import type { Dictionary } from "@/i18n/dictionaries";

const STACK = ["SAP TM", "BN4L", "S/4HANA"];

/**
 * Hero as a manifest cover, not a split screen.
 *
 * The globe is not a "mockup on the right" — it bleeds off the right edge and
 * sits *behind* the headline, so type and object share the same space instead
 * of dividing it. That overlap is what gives the section depth.
 */
export function Hero({ t }: { t: Dictionary }) {
  return (
    <section className="relative isolate overflow-hidden pb-20 pt-36 md:pb-28 md:pt-44 lg:pt-52">
      {/* Canvas spans the hero; the planet's right-anchored, cropped framing is
          set inside the scene (camera + offset per breakpoint), not by CSS
          cropping — so it stays monumental instead of merely scaled down. */}
      <LogisticsGlobe className="absolute inset-0 z-[1]" />

      {/* Legibility layer. The heavy lifting happens in the shaders, which dim
          the network by screen position; this is only the last, very soft step
          so the transition never reads as a dark rectangle over the canvas. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(100deg,var(--color-ink-950)_4%,rgba(3,5,10,0.72)_34%,rgba(3,5,10,0.12)_58%,transparent_78%)]"
      />

      <div className="shell relative z-[3]">
        <Reveal className="flex items-center gap-4">
          <span className="index-label tnum text-brand-blue-soft">[00]</span>
          <span className="index-label">{t.hero.eyebrow}</span>
        </Reveal>

        <h1 className="mt-10 font-display text-hero font-semibold text-white">
          <MaskReveal as="span" className="block">
            {t.hero.title}
          </MaskReveal>
          <MaskReveal as="span" delay={120} className="block text-fg-dim">
            {t.hero.titleAccent}
          </MaskReveal>
        </h1>

        <div className="grid12 mt-14 md:mt-20">
          <Reveal delay={220} className="col-span-4 md:col-span-5 lg:col-span-5">
            <p className="measure text-base leading-relaxed text-fg-muted text-pretty md:text-lg">
              {t.hero.subtitle}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a href="#contact" className="btn-primary">
                {t.hero.ctaPrimary}
                <Arrow />
              </a>
              <a href="#cases" className="btn-ghost">
                {t.hero.ctaSecondary}
                <Arrow />
              </a>
            </div>
          </Reveal>
        </div>

        {/* Capability strip — reads as the manifest's footer line. */}
        <div className="mt-20 md:mt-28">
          <RuleDraw />
          <Reveal delay={120} className="flex flex-wrap items-baseline gap-x-10 gap-y-3 pt-5">
            {STACK.map((item, i) => (
              <span key={item} className="flex items-baseline gap-3">
                <span className="index-label tnum text-fg-dim">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-mono text-sm tracking-wide text-fg">{item}</span>
              </span>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg
      className="btn-arrow"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
