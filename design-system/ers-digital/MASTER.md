# ERS Digital — Design System
## "Malha Operacional" (Operational Grid)

> Global Source of Truth. Authored direction, derived from `ui-ux-pro-max` research.
> Page-specific deviations go in `design-system/ers-digital/pages/[page].md` and override this file.

---

## 1. Research trail — what the skill returned, and what we did with it

| Skill query | Returned | Verdict |
|---|---|---|
| `--design-system` B2B enterprise SAP logistics | Pattern **Enterprise Gateway**, style **Bento Grids**, light corporate palette | Pattern ✅ / Style ❌ (card-grid is a stated anti-goal) / Palette ❌ (navy must be preserved) |
| `--design-system` editorial swiss asymmetric dark | Portfolio Grid + Bento Grids again | ❌ — revealed Bento is the DB default for "grid" language; stopped trusting the style slot |
| `--design-system` technical control-room dark | Pattern **Real-Time / Operations Landing** | ✅ "Dark, status indicators, data-dense but scannable" maps cleanly onto logistics/TM |
| `--domain landing` enterprise b2b trust | **Trust & Authority + Conversion** — *Hero(credibility) → Proof → Solutions → CTA*; "Navy/Grey corporate. Trust blue. **Accent for CTA only**" | ✅ Section order + accent discipline |
| `--domain style` dark editorial premium | **Swiss Modernism 2.0** (12-col, mathematical spacing, asymmetric balance, single accent, WCAG AAA, Tailwind 10/10, dark ✓ Full) · **Exaggerated Minimalism** (clamp type, −0.05em) · **Modern Dark Cinema** (no pure #000, hairline borders, expo easing) | ✅ **Spine of the redesign** |
| `--domain typography` technical premium | **Space Grotesk + Inter + JetBrains Mono** — "Space Grotesk 600–700 headings (geometric, technical); Inter body; JetBrains Mono for all data/stats" | ✅ Validates the existing fonts — keep, push the scale |
| `--domain gsap` reveal/stagger/parallax | Scroll Reveal Standard (y24, stagger .08, power2.out, top 85%) · Parallax **Subtle** (yPercent 5–15, decorative layers only, never text) · **SplitText is a paid Club plugin** | ✅ Values adopted · ❌ SplitText rejected → native CSS mask reveal, zero deps |
| `--domain ux` animation + a11y | **"Excessive Motion — animate 1–2 key elements per view max" (High)** · reduced-motion (High) · focus states (High) · contrast 4.5:1 (High) | ✅ Hard constraints |
| `--stack nextjs` | next/font · next/image · `'use client'` only when needed | ✅ Already compliant |

**Skill anti-patterns honoured:** no playful design · no hidden credentials · **no AI purple/pink gradients** → purple demoted to atmosphere only; never a CTA, never a text gradient.

---

## 2. Concept

The site reads as a **technical manifest** — a logistics control document. Precision, ruled lines, indexed sections, tabular figures. The globe is the single organic, living element; everything around it is ruled and typographic. Depth comes from *layered darkness and hairlines*, not from shadows and glows.

1. **The grid is visible.** Hairline column rules run down the page like a drawing sheet. Signature element.
2. **One accent.** Blue carries every action. Purple is atmosphere. Nothing else competes.
3. **Rhythm through asymmetry.** No two consecutive sections share the same column span or alignment.

---

## 3. Tokens

### Color — evolved from the existing palette, nothing replaced

| Token | Hex | Role |
|---|---|---|
| `--color-ink-950` | `#03050A` | page floor (new, deepest) |
| `--color-ink-900` | `#05070D` | base surface (unchanged) |
| `--color-ink-850` | `#070B16` | raised surface (new) |
| `--color-ink-800` | `#0A1428` | panel |
| `--color-ink-700` | `#0F1E3D` | panel raised |
| `--color-ink-600` | `#142A55` | border tint |
| `--color-brand-blue` | `#1E5BFF` | **the** accent — CTA, active, focus |
| `--color-brand-blue-soft` | `#4A7BFF` | accent text on dark |
| `--color-brand-blue-deep` | `#0B3BC4` | pressed / depth (new, derived) |
| `--color-brand-purple` | `#6B3FFF` | **atmosphere only** |
| `--color-fg` | `#E6ECF5` | primary text |
| `--color-fg-muted` | `#8A96A8` | secondary text (4.6:1 on ink-900 ✓) |
| `--color-fg-dim` | `#5C6679` | indices/labels only, never body |
| `--rule` | `rgba(255,255,255,0.07)` | hairline grid |
| `--rule-strong` | `rgba(255,255,255,0.14)` | active hairline |

Never `#000000` (OLED smear — Modern Dark Cinema). `ink-950` is the floor.

### Type — existing tri-stack, harder scale

- **Display:** Space Grotesk 600–700 · **Body/UI:** Inter 400–600 · **Data/indices:** JetBrains Mono 500 uppercase +0.18em

| Step | Size | Line-height | Tracking |
|---|---|---|---|
| `text-hero` | `clamp(3.25rem, 8.5vw, 7.5rem)` | 0.90 | −0.045em |
| `text-display` | `clamp(2.25rem, 5vw, 4.25rem)` | 0.95 | −0.035em |
| `text-title` | `clamp(1.5rem, 2.2vw, 2.125rem)` | 1.10 | −0.02em |
| body | 1rem → 1.125rem | 1.65 | 0 |
| `text-index` | 0.6875rem | 1 | +0.18em |

Body measure capped at 68ch.

### Space — 8px base, density 4/10

Section rhythm `--section-y: clamp(6rem, 11vh, 10rem)`.

### Motion

| Token | Value |
|---|---|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--dur-fast` | `180ms` |
| `--dur` | `320ms` |
| `--dur-slow` | `640ms` |

Budget: **max 2 animated elements per viewport**. Reveals are `opacity + transform` only. Parallax ≤ 12%, atmosphere layer only. Everything collapses under `prefers-reduced-motion`.

---

## 4. Components

| Component | Role |
|---|---|
| `GridRules` | Fixed hairline columns behind everything. The signature. One element, one gradient, zero JS. |
| `SectionHead` | `[01]` mono index + rule + title. Every section — creates the manifest rhythm. |
| `Reveal` | Fade/rise via IntersectionObserver; unobserves after firing. |
| `MaskReveal` | clip-path wipe for headings — native, replaces the paid SplitText. |
| Solutions | Indexed editorial rows with hairline dividers — **not** a card grid. |
| Cases | Full-bleed data panel, tabular figures. |
| Clients | Ruled band. Monochrome light logos straight on the dark surface, hairline cell dividers, no tiles. |
| `panel-frame` | Corner brackets. Marks a surface as a mounted plate — reserved for credential/status moments. |
| Credential plate | SAP badge inset on a dark plate with brackets. Badge art untouched; white is ~11% of the plate. |

### Logo treatment — decided per mark, never by blanket filter

A single CSS filter cannot serve twelve marks. `brightness(0) invert(1)` flattens
a logo to its silhouette: **Volkswagen**'s roundel becomes a solid disc and loses
the monogram. So each file was measured (alpha coverage + luminance distribution
of opaque pixels) and treated accordingly:

| Group | Marks | Treatment |
|---|---|---|
| Dark / mid ink | IBM, Talke, Bridgestone, Rochalog, Braskem, InBetta, Rivelli, SimpleWMS, T-Systems, Coopercitrus, **Volkswagen** | `grayscale → negate` — inverts luminance, so interior negative space survives (VW's monogram stays readable inside the roundel) |
| Already light | **Serangeli** (100% light pixels, saturation 0.00) | Passed through untouched — inverting would turn it black and erase it |

All marks then normalised to a mean optical weight of ~208 so none shouts or
fades. Rest opacity 0.55 → **4.35:1** against `ink-950` (WCAG non-text minimum is
3:1); hover 1.0 → 13.2:1. Sources and the regeneration recipe live in
`assets-src/` — outside `public/`, so they never ship.

---

## 5. Hero globe — authored Three.js scene

Replaces the previous `cobe` canvas (dependency removed). React Three Fiber, no
drei, no post-processing — glow comes from additive materials and a Fresnel rim,
not from bloom.

| Piece | Notes |
|---|---|
| `lib/geo.ts` | The single lat/lng → Vec3 conversion. Every hub, route endpoint and particle goes through it; nothing is hand-placed in world space. Also holds the great-circle arc builder and a seeded PRNG so scatter is deterministic. |
| `lib/landmasses.ts` | **Authored** continent outlines as `[lat, lng]` rings — not a satellite texture. Rasterised and eyeballed before use to confirm the silhouette reads as Earth. |
| `lib/routes.ts` | The network as data: `TransportRoute[]` with `mode`, origin, destination. Hubs are derived from the routes so a marker can never drift off the network. |
| `lib/scene-config.ts` | Per-tier camera, offset, scale, particle budget, concurrent routes, DPR. Responsiveness lives in the scene, not in CSS scaling. |
| `globe-core` | Opaque near-black body — it writes depth, which is what occludes the far hemisphere. Thin Fresnel atmosphere on a back-side shell. |
| `geographic-surface` | Equal-area rejection sampling inside the rings → `Points` with a custom shader. |
| `transport-network` | All arcs merged into **one** `LineSegments` draw call; which route is lit and how far its pulse has run are driven by two uniform arrays. |
| `orbital-system` | Perfect circles, no pulses, ~16% opacity — deliberately distinct from traffic. |

**Mode is read from behaviour, never from icons:** air arcs high and fast, sea
hugs the surface and crawls, road is short, low and frequent (`MODE_PROFILE`).

**Legibility mask** is done in the shaders, not with an overlay rectangle: each
vertex computes its own NDC x and dims toward the left, so the planet walks into
the light from the right. A very soft CSS gradient is only the last step.

**Concurrency** is capped by a lane scheduler — routes are split into N lanes and
each lane runs one route at a time, so exactly N can be lit at once.

**Performance / a11y:** DPR capped per tier · `frameloop="never"` when the hero
leaves the viewport or the tab is hidden · geometries and materials disposed on
unmount · three.js code-split behind `next/dynamic` so it is absent from the
initial chunks · a gradient-only static fallback holds the exact framing until
the canvas is ready · `prefers-reduced-motion` freezes the scene with a few
routes held mid-flight · canvas is `pointer-events: none` throughout, with
pointer parallax read from a window listener.

**Framing** (verified by projecting the sphere per tier): bleeds off the right
and bottom edge at every breakpoint; the left 35–40% stays clear for the
headline on tablet up; mobile crops both sides and sits low.

---

## 6. Pre-delivery checklist

- [ ] Contrast ≥ 4.5:1 body / ≥ 3:1 large, verified on `ink-900`
- [ ] Visible focus ring on every interactive element
- [ ] `prefers-reduced-motion` honoured
- [ ] Touch targets ≥ 44px
- [ ] No emoji as icons — SVG only
- [ ] `cursor-pointer` on clickables
- [ ] Every image has width/height (no CLS)
- [ ] 375 / 768 / 1024 / 1440 verified, no horizontal scroll at 375
