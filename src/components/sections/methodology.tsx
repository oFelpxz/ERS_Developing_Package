import { Reveal, RuleDraw } from "@/components/reveal";
import { SectionHead } from "@/components/section-head";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * The head sits in the right half here, against Solutions' left-aligned head.
 * Alternating the anchor column is what keeps the page from settling into a
 * single predictable rhythm.
 */
export function Methodology({ t }: { t: Dictionary }) {
  const steps = t.methodology.steps;

  return (
    <section id="methodology" className="section">
      <div className="shell">
        <div className="grid12">
          <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
            <SectionHead index="02" kicker={t.methodology.eyebrow} title={t.methodology.title} />
          </div>
        </div>

        {/* Sequence. One rule carries all five stops. */}
        <div className="mt-16 md:mt-24">
          <RuleDraw />
          <ol className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-8">
            {steps.map((step, i) => (
              <Reveal
                as="li"
                key={step.title}
                delay={Math.min(i, 5) * 70}
                className="relative pt-8 lg:pt-10"
              >
                {/* Tick on the rule, marking this stop. */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-px w-10 bg-brand-blue"
                />
                <span className="index-label tnum block text-fg-dim">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{step.title}</h3>
                <p className="measure mt-3 text-sm leading-relaxed text-fg-muted text-pretty">{step.desc}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
