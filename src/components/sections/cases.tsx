import { MaskReveal, Reveal, RuleDraw } from "@/components/reveal";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

/**
 * The dense beat of the page.
 *
 * Everything else breathes; this one is a full-bleed slab that covers the
 * column rules and packs figures tightly. That density contrast is the rhythm —
 * it is why the open sections around it read as open.
 */
export function Cases({ locale, t }: { locale: Locale; t: Dictionary }) {
  const c = t.cases.rochalog;

  // "Rochalog: <rest>" → the wordmark is set separately, so drop the repeat.
  const sepIndex = c.title.indexOf(": ");
  const subtitle = sepIndex >= 0 ? c.title.slice(sepIndex + 2) : c.title;
  const featured = locale === "pt" ? "Case em destaque" : locale === "es" ? "Caso destacado" : "Featured case";

  return (
    <section id="cases" className="relative">
      {/* Full-bleed slab. Sits above the grid rules on purpose. */}
      <div className="relative z-10 border-y border-white/[0.07] bg-ink-850">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-noise opacity-[0.35]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-brand-blue/10 blur-[130px]"
        />

        <div className="shell relative py-[var(--section-y)]">
          <Reveal className="flex items-center gap-4">
            <span className="index-label tnum text-brand-blue-soft">[03]</span>
            <span className="index-label">{featured}</span>
            <RuleDraw className="flex-1" />
          </Reveal>

          <div className="grid12 mt-10">
            {/* Identity */}
            <div className="col-span-4 md:col-span-8 lg:col-span-7">
              <MaskReveal
                as="h2"
                className="font-display text-display font-bold tracking-tight text-white"
              >
                ROCHALOG
              </MaskReveal>
              <Reveal delay={100}>
                <p className="measure mt-6 font-display text-lg font-medium text-balance text-fg md:text-xl">
                  {subtitle}
                </p>
                <p className="measure mt-6 text-sm leading-relaxed text-fg-muted text-pretty md:text-base">
                  {c.summary}
                </p>
                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                  {c.tags.map((tag) => (
                    <span key={tag} className="font-mono text-index uppercase text-fg-dim">
                      {tag}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Figures — tabular, right-anchored, reads as a data readout. */}
            <Reveal delay={160} className="col-span-4 mt-14 md:col-span-8 lg:col-span-4 lg:col-start-9 lg:mt-0">
              <dl>
                {c.metrics.map((m) => (
                  <div key={m.label} className="border-t border-white/[0.07] py-5 first:border-t-0 first:pt-0">
                    <dt className="index-label">{m.label}</dt>
                    <dd className="tnum mt-2 font-mono text-2xl font-semibold text-white md:text-3xl">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* Delivery sequence — every phase reads as complete. Singling out
              Go-Live as the only step with a status caption made the whole
              engagement look mid-flight rather than finished. */}
          <div className="mt-20 md:mt-24">
            <RuleDraw />
            <ol className="grid grid-cols-2 gap-y-8 pt-6 sm:grid-cols-4">
              {c.timeline.map((step, i) => (
                <Reveal as="li" key={step.label} delay={i * 70} className="relative pr-4">
                  <span aria-hidden="true" className="absolute -top-6 left-0 h-px w-8 bg-brand-blue" />
                  <div className="font-mono text-index uppercase text-white">{step.label}</div>
                  <div className="mt-2 text-xs text-brand-blue-soft">{step.status}</div>
                </Reveal>
              ))}
            </ol>
          </div>

          {/* Differentials + CTA */}
          <div className="grid12 mt-20 md:mt-24">
            <Reveal className="col-span-4 md:col-span-8 lg:col-span-7">
              <h3 className="index-label text-fg-muted">{c.differentialsTitle}</h3>
              <ul className="mt-6 space-y-4">
                {c.differentials.map((d, i) => (
                  <li key={d} className="flex gap-5 border-t border-white/[0.07] pt-4">
                    <span className="index-label tnum shrink-0 pt-1 text-brand-blue-soft">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="measure text-sm leading-relaxed text-fg text-pretty">{d}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={120} className="col-span-4 mt-10 md:col-span-8 lg:col-span-4 lg:col-start-9 lg:mt-0 lg:self-end">
              <a href="#contact" className="btn-ghost w-full justify-between sm:w-auto lg:w-full">
                {c.cta}
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
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
