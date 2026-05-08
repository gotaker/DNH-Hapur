# Phase 3 — impeccable critique (home page)

Date: 2026-05-08
Surfaces: `/hi`, `/en`
Reviewer: agent-driven critique against the brand register defined in
`PRODUCT.md` and the project shape brief in
`.cursor/plans/dnh_hapur_bilingual_rebuild_50f5d78b.plan.md`.

The home page is the only surface that carries the full register; this
review is the gate before the design language propagates into phase 4
templates.

## 1. Register and lane

| Question | Answer |
|---|---|
| Register | Brand (design IS the product) — confirmed |
| Lane | Institutional gravitas, deep hospital blue committed | confirmed |
| Slop test (first-order) | Could anyone guess this from "hospital website"? No — there is no white-and-teal, no smiling stock doctor, no rounded icon cards, no slider |
| Slop test (second-order) | Could anyone guess "hospital that is not white-and-teal"? Plausible — the closest reflex would be "navy + cream luxury hospital" (Mass General Phillips). We diverge by leaning into Devanagari at scale, numbered institutional ordinals, and a strict grid rather than centered editorial blocks |
| AI slop test | Could a viewer say "AI made that"? Some doubt — the hero structure is conventional. Mitigated by typography choices (Tiro Devanagari) and the College teaser block |

Verdict: **PASS**, with the caveat that the home photograph is still a generic Unsplash hospital interior. Phase 6 must replace it.

## 2. Color

- Strategy: Committed. The deep blue carries the utility row, footer, sticky CTA, college teaser, and emergency band. Counted across major surfaces, that is roughly 35–45% of the home — within the 30–50% target.
- Tinted neutrals: every surface and rule uses an OKLCH neutral chroma-tinted toward the brand hue. No `#fff`, no `#000`. Verified by reading the page HTML for `oklch(`.
- Accent: `--color-accent` (warm saffron-cream) appears on the emergency-call dot, on the academics eyebrow, on the academics primary CTA, on the emergency-CTA hover, and on the locale switcher hover. Estimated coverage ≤4% of surface.
- Hard ban check: no `#fff`, no `#000`, no gradient text. Confirmed.

Verdict: **PASS**.

## 3. Typography

- Display: Tiro Devanagari Hindi loaded for both scripts. Renders cleanly at H1 (`text-5xl`) and at the academics teaser headline (also `text-5xl`).
- Body: Hind, both scripts. Devanagari leading bump (+0.1) applied via `html[lang='hi']` selector.
- Reflex-reject check: no Inter, DM Sans, Plus Jakarta, Outfit, Plex, Fraunces, Playfair, or Cormorant. Confirmed in `lib/fonts.ts`.
- Numerals: Latin throughout for stats and dates, even in the Hindi locale, matching Indian institutional convention. The date formatter uses `Intl.DateTimeFormat('hi-IN')`, which yields Devanagari weekday names but Latin digits — that is correct.
- Eyebrow style: uppercase + tracking under English; preserved-case + lower tracking under Hindi (Devanagari does not have casing). Verified in `globals.css` `.eyebrow` rule with `html[lang='hi']` override.

Verdict: **PASS**.

## 4. Layout and motion

- Strict grid carries the institutional voice. The Centers of Excellence and News sections both use a `grid gap-px bg-rule` to draw a rule-grid on the surface — a deliberate civic-form move.
- Numbered ordinals (`N°01–N°05`) on the centers and `01–12` on the departments index do the work that icon cards would otherwise do, more dignified.
- No card grids with icon-heading-text repeated. The doctor block uses photographs and typographic name treatment, not template cards.
- Motion: confined to `transition-colors`, the accordion keyframes, and the sheet slide. No parallax, no scroll-triggered theatrics.
- Hard ban check: no side-stripe borders (every border is a full hairline). No glassmorphism after removing the sticky-header `backdrop-blur` (kept solid surface with full-width hairline rule).

Verdict: **PASS**.

## 5. Bilingual rendering

- `lang="hi"` on the Hindi locale; `lang="en"` on English. Confirmed at the `<html>` level via `app/[locale]/layout.tsx`.
- `<title>देव नंदिनी अस्पताल और चिकित्सा महाविद्यालय</title>` rendered on `/hi`.
- Devanagari numerals avoided in favour of Latin per the institutional convention.
- Locale switcher button announces the next locale to screen readers in its own language (`lang={next}`).
- Message catalog parity test (`tests/unit/messages.test.ts`) is green: 6/6.

Verdict: **PASS**.

## 6. Findings to address (graded by phase)

| # | Finding | Phase |
|---|---|---|
| 1 | Hero photograph is a generic Unsplash hospital interior. Replace with real institutional photography. | 6 |
| 2 | Doctor portraits are also generic. Replace with real consented headshots. | 6 |
| 3 | Stat strip in college teaser shows "FOGSI" as a value rather than a number — read more like a credential than a stat. Acceptable for now; revisit if the institution provides better numbers (e.g., "research papers / year"). | 4 |
| 4 | The Centers of Excellence section is a 5-column grid that may compress on tablet. Tested at 768px: collapses to 2 columns, 5th cell sits alone. Acceptable. | — |
| 5 | News section ships only 3 items on home; full list page (phase 4) needs a calendar / category filter. | 4 |
| 6 | Wordmark is currently a styled text composition. Phase 6 should ship a real SVG path-based mark for crisp print. | 6 |
| 7 | No `prefers-reduced-motion` audit performed beyond the global rule. Should re-test once accordions and sheet animations are exercised. | 8 |
| 8 | No `dir` switching at the body level for any potential RTL surface. Both supported scripts are LTR; flagged for future Urdu support if it ever lands. | — (deferred) |

## 7. Performance and accessibility (smoke check)

Will receive a real audit in phase 8. Initial signals from the dev server:

- LCP candidate is the hero image. AVIF + responsive sizes via `next/image` is wired in for doctor portraits but not yet for the hero (which uses `background-image`). **Phase 8 todo**: convert the hero to `<Image priority>` for LCP gains.
- All routes return 200 in the smoke test; `/api/health` returns ok.
- No console errors in dev.

## 8. Verdict

The home page passes the impeccable register check well enough to propagate into phase 4 templates. Findings 1, 2, 6, and the LCP-hero conversion in finding 7 are explicitly tracked into phases 6 and 8.
