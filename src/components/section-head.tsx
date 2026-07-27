import { MaskReveal, Reveal, RuleDraw } from "@/components/reveal";

interface SectionHeadProps {
  /** Manifest index, e.g. "01". Mono, gutter-aligned. */
  index: string;
  /** Short mono kicker sitting beside the index. */
  kicker: string;
  title: string;
  /** Optional lead paragraph. Kept to a 52ch measure so it never competes with the title. */
  lead?: string;
  /** Column span of the title block. Varies per section to break the rhythm. */
  titleClassName?: string;
}

/**
 * Every section opens the same way: index + kicker on the rule, then the title.
 * That repetition is the point — it is what makes the page feel like one document
 * instead of a series of unrelated blocks.
 */
export function SectionHead({ index, kicker, title, lead, titleClassName = "" }: SectionHeadProps) {
  return (
    <header>
      <Reveal className="flex items-center gap-4">
        <span className="index-label tnum text-brand-blue-soft">[{index}]</span>
        <span className="index-label">{kicker}</span>
        <RuleDraw className="flex-1" />
      </Reveal>

      <MaskReveal
        as="h2"
        delay={80}
        className={`mt-8 font-display text-display font-semibold text-balance text-white ${titleClassName}`}
      >
        {title}
      </MaskReveal>

      {lead && (
        <Reveal delay={160}>
          <p className="measure-tight mt-6 text-base leading-relaxed text-fg-muted text-pretty md:text-lg">{lead}</p>
        </Reveal>
      )}
    </header>
  );
}
