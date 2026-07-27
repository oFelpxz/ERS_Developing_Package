import { Reveal, RuleDraw } from "@/components/reveal";
import { SectionHead } from "@/components/section-head";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

const MODULE_CODES = ["TM", "BN4L", "IMPL", "ALOC"];

/**
 * Editorial rows, not a card grid.
 *
 * Four identical boxes would flatten four genuinely different offerings into
 * one texture. As indexed rows on a shared rule, each service gets its own
 * line in the manifest and the eye moves down instead of bouncing around.
 */
export function Solutions({ locale, t }: { locale: Locale; t: Dictionary }) {
  const learnMore = locale === "pt" ? "Saiba mais" : locale === "es" ? "Saber más" : "Learn more";

  return (
    <section id="solutions" className="section">
      <div className="shell">
        <div className="grid12">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <SectionHead index="01" kicker={t.solutions.eyebrow} title={t.solutions.title} />
          </div>
        </div>

        <div className="mt-16 md:mt-24">
          {t.solutions.items.map((item, i) => (
            <a
              key={item.title}
              href="#contact"
              className="row-link group block focus-visible:outline-offset-4"
              aria-label={`${item.title} — ${learnMore}`}
            >
              <RuleDraw delay={i * 60} />

              <div className="grid12 relative py-8 md:py-10">
                {/* Hover: a tint plus an accent bar that grows out of the rule.
                    Contained at inset-x-0 — a negative inset here overflowed the
                    row on narrow viewports. No shadow, no lift. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 bg-brand-blue/0 transition-colors duration-[320ms] group-hover:bg-brand-blue/[0.035]"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-0 h-px w-0 bg-brand-blue transition-[width] duration-[640ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
                />

                <Reveal className="col-span-4 flex items-baseline gap-4 md:col-span-8 lg:col-span-3 lg:block">
                  <span className="index-label tnum transition-colors duration-[320ms] group-hover:text-brand-blue-soft">
                    [{String(i + 1).padStart(2, "0")}]
                  </span>
                  <span className="font-mono text-sm tracking-wide text-fg-muted lg:mt-3 lg:block">
                    {MODULE_CODES[i]}
                  </span>
                </Reveal>

                <Reveal delay={60} className="col-span-4 mt-4 md:col-span-8 lg:col-span-4 lg:mt-0">
                  <h3 className="font-display text-title font-semibold text-balance text-white">{item.title}</h3>
                </Reveal>

                <Reveal delay={120} className="col-span-4 mt-4 md:col-span-8 lg:col-span-5 lg:mt-0">
                  <p className="measure text-sm leading-relaxed text-fg-muted text-pretty">{item.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-blue-soft transition-colors duration-[320ms] group-hover:text-white">
                    {learnMore}
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
                  </span>
                </Reveal>
              </div>
            </a>
          ))}
          <RuleDraw />
        </div>
      </div>
    </section>
  );
}
