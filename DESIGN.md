# DESIGN.md — Dev Nandini Hospital & Medical College

> The design language. Read after PRODUCT.md by `$impeccable` before any
> visual work. Every token here is wired into Tailwind v4 via `@theme`
> in `app/globals.css` — that file is the canonical implementation; this
> file is the canonical _explanation_.

## Philosophy in one paragraph

DNH is **institutional**, not retail. The page reads like a well-set
newspaper or a wayfinding system, not a SaaS landing. We commit to a
single deep hospital blue across major surfaces (the "committed" color
strategy from impeccable), pair it with warm tinted neutrals — never
white, never black — and treat Devanagari as a first-class typographic
citizen with its own face, leading, and tracking. Spacing varies; cards
are nearly absent; rules and eyebrows do the structural work.

## Aesthetic lane

**Editorial-typographic, signage-grade.** The reference points: an
Indian newspaper masthead, a university viewbook, a well-designed
hospital wayfinding system. The opposite of dashboard chrome. The
opposite of Bootstrap-era hospital sites with teal gradients and stock
photography.

Two reflexes we explicitly avoid (per the impeccable second-order
category-reflex check):

- **First-order reflex:** "Hospital site → white background, teal/aqua
  accent, smiling-doctor stock." Rejected.
- **Second-order reflex:** "Indian institutional site → marigold and
  green, ornamental Devanagari, gradient buttons." Rejected.

What we ship instead is editorial typography on warm-tinted neutrals
with a single committed deep blue, no gradients, no decorative borders,
and a Devanagari display face given equal weight to its Latin pair.

## Color

OKLCH throughout. Pure white and pure black are forbidden. Every
neutral carries a small tint toward the brand hue (`240`–`252`).

### Tokens (from `app/globals.css`)

| Token                | OKLCH                | Role                                                                                       |
| -------------------- | -------------------- | ------------------------------------------------------------------------------------------ |
| `--color-surface`    | `0.97 0.006 240`     | Page background. Warm bone, never `#fff`. Default body.                                    |
| `--color-surface-mute` | `0.94 0.008 240`   | Quiet bands inside long pages (trust strips, divider sections).                            |
| `--color-surface-deep` | `0.91 0.010 240`   | Image placeholder backgrounds, soft panels.                                                |
| `--color-ink`        | `0.18 0.04 250`      | Primary type. Deep blue-black, never `#000`.                                               |
| `--color-ink-mute`   | `0.42 0.03 250`      | Secondary copy, eyebrows, captions.                                                        |
| `--color-ink-soft`   | `0.62 0.02 250`      | Tertiary annotations, ordinals, faint timestamps.                                          |
| `--color-brand`      | `0.38 0.12 250`      | The committed hospital blue. Carries 30–50% of major surfaces.                             |
| `--color-brand-deep` | `0.28 0.10 252`      | Utility row, footer, hover state on primary CTA.                                           |
| `--color-brand-soft` | `0.55 0.10 248`      | Reserved for hovered links and small accents inside `bg-brand` regions.                    |
| `--color-accent`     | `0.85 0.06 75`       | Warm saffron-cream. **Emphasis only — ≤5% of surface.** Eyebrow text on dark, dot indicator. |
| `--color-accent-deep`| `0.7 0.12 65`        | Hovered state of `--color-accent` chips.                                                   |
| `--color-signal`     | `0.55 0.18 25`       | **Emergency callouts only.** Never decorative. Never used for "danger zones" in forms.     |
| `--color-rule`       | `0.85 0.012 240`     | 1px hairlines (lists, sections, borders).                                                  |
| `--color-rule-strong`| `0.72 0.018 245`     | 1px strong rules (the underline on the secondary CTA).                                     |

### Color strategy

**Committed.** The deep brand blue carries 30–50% of major surfaces —
the masthead utility row, the emergency band, the footer. The body of
the page lives on warm-tinted bone (`surface`). Saffron-cream accent
appears ≤5% (eyebrow on dark, the small accent dot in the utility
row). The signal red is reserved for genuine emergency callouts and
must not creep into form errors or warning banners — those use
`ink-mute` text on `surface-deep`.

### Theme

**Light, by physical scene:** A patient or family member on a phone in
varied light (waiting room fluorescents, midday sun, a power-cut dusk
in a tier-2 town). Light surfaces with strong type contrast read
better in those conditions and signal "official institution" rather
than "tech product." Dark mode is not a default and is not supported
in phase 1.

### Contrast targets

- Body type on `surface`: AAA (≥7:1). The token pair `--color-ink` on
  `--color-surface` clears this comfortably.
- Secondary type (`ink-mute` on `surface`): AA large (≥4.5:1).
- White type on `--color-brand` and `--color-brand-deep`: AA minimum
  for body, AAA for the emergency phone number.

## Typography

Bilingual. Devanagari and Latin are both first-class; neither is a
fallback for the other.

### Faces

| Token             | Family                                 | Loaded by         | Use                                                         |
| ----------------- | -------------------------------------- | ----------------- | ----------------------------------------------------------- |
| `--font-display`  | Tiro Devanagari Hindi (matched Tiro Latin) | `lib/fonts.ts` | H1, H2, H3, large pull quotes. One weight: 400.             |
| `--font-sans`     | Hind (Indian Type Foundry, Devanagari + Latin) | `lib/fonts.ts` | All body, navigation, UI copy. Weights 300–700 available.   |
| `--font-mono`     | JetBrains Mono → SFMono → Menlo        | system            | Phone numbers, ordinals, codes. Tabular figures.            |

Tiro is John Hudson's design for sustained Hindi reading; its matched
Latin sits on the same x-height. Hind is the body face that handles the
weight load — both subsets are preloaded and `display: swap`.

### Scale

A modular fluid scale, all `clamp()` from `2xl` upward. Ratios stay
≥ 1.25 between adjacent steps. Variable per spec, but the actual sizes
in use:

```
--text-xs:   0.78rem
--text-sm:   0.875rem
--text-base: 1rem
--text-lg:   1.125rem
--text-xl:   1.35rem
--text-2xl:  clamp(1.5rem, 1.2rem + 1.4vw, 2rem)
--text-3xl:  clamp(1.95rem, 1.4rem + 2.2vw, 2.6rem)
--text-4xl:  clamp(2.45rem, 1.6rem + 3.4vw, 3.4rem)
--text-5xl:  clamp(3rem, 1.8rem + 4.8vw, 4.6rem)
--text-6xl:  clamp(3.6rem, 2rem + 6.4vw, 6rem)
```

### Bilingual mechanics

- `body { line-height: 1.55 }` (Latin default).
- `html[lang='hi'] body { line-height: 1.7 }` — Devanagari needs more
  vertical room; conjuncts and matras read better with extra leading.
- Display (`h1`, `h2`, `h3`) defaults to `line-height: 1.05` and
  `letter-spacing: -0.01em`. Under `lang='hi'` we open it back up to
  `1.15` and remove the negative tracking — Devanagari does not want
  tight tracking.
- The eyebrow utility (`.eyebrow`) is uppercased Latin small-caps with
  wide letter-spacing; under `lang='hi'` it drops uppercase (Devanagari
  has no case) and tightens spacing.
- `font-feature-settings: 'ss01', 'cv11'` — Hind's stylistic set 1
  (alternate Latin lowercase a) and contextual variant 11 (cleaner
  zero) are on by default.

### Line length

Body copy capped at ~65–75ch via `max-w-prose` on long-form, or via
`container-narrow` (48rem) on essay-style sections. Avoid full-bleed
paragraphs.

## Spacing & rhythm

Two named section-level rhythms drive the vertical:

- `--spacing-section` = `clamp(4rem, 3rem + 4vw, 7rem)`. Default
  between major bands.
- `--spacing-section-tight` = `clamp(2.5rem, 2rem + 2vw, 4rem)`. Used
  when two related bands sit adjacent (e.g. trust strip following a
  hero).

Inline padding inside containers is also fluid:
`clamp(1.25rem, 0.5rem + 3vw, 2.5rem)`. We never use a fixed
`px-6` everywhere; rhythm is intentionally non-uniform.

## Layout

### Containers

| Utility               | Max width  | Use                                                              |
| --------------------- | ---------- | ---------------------------------------------------------------- |
| `.container-wide`     | `88rem`    | Top-level page chrome (header, footer, hero shells).             |
| `.container-content`  | `72rem`    | Main content sections.                                           |
| `.container-narrow`   | `48rem`    | Long-form essays, single-column reading.                         |

All three set `margin-inline: auto` and the fluid inline padding.

### Radii

`--radius-sm: 2px`, `--radius-md: 4px`, `--radius-lg: 8px`. **Buttons
have no radius by default** — squared edges read as institutional;
softly-rounded edges read as SaaS. The 8px radius is reserved for
photographic media that benefits from a soft edge. Never larger.

### Elevation

We do not ship shadows. Depth comes from rules, color steps, and
density — not from drop-shadows or blurs. Glassmorphism is forbidden
(per the shared design laws). If you reach for a shadow, you are
solving the wrong problem.

## Components & patterns (in repo today)

These are conventions, not a component library. Re-use them; do not
replace them with a popover-button-modal kit.

### Site header (`components/site-header.tsx`)

Two stacked rows:

1. **Utility row** — `bg-brand-deep` on `text-surface`. Carries the
   24×7 emergency phone (with the saffron accent dot, `font-mono`
   number), institutional email, and the locale switcher.
2. **Brand row** — `container-wide`, baseline-aligned. Wordmark on the
   left (eyebrow + display short-name). Primary nav on the right with
   "Book Appointment" as a `bg-brand` rectangular button — no radius,
   no icon, no shadow.

The header is _always_ rendered server-side; only the locale switcher
is a client component.

### Site footer (`components/site-footer.tsx`)

Full `bg-brand-deep` band, four-column grid (`1.3fr 1fr 1fr 1fr`),
saffron-accent eyebrows over each group. The institutional address is
rendered in `<address>` with the local-language form via the `site`
constant. Phones are `font-mono`. Bottom rule has 10% white separator
and a copyright + credit line at `opacity-70`.

### Hero pattern

Split column with statement on the left (eyebrow → 5xl display
headline → body lede → primary + secondary CTA), photographic field on
the right (`aspect-[4/5]` portrait, real photography only — no
illustration, no SVG hero). The split collapses to single column
under `lg`.

### Trust strip

`bg-surface-mute` band, eyebrow, text-only list of accreditation
acronyms in a multi-column grid. **No logo wall** in phase 1 — text
treatment first, logos arrive later only if the cleared logos read
well at the chosen size.

### Department index

Numeric ordinal (`font-mono`, `text-ink-soft`, `tabular-nums`,
zero-padded `01–99`) followed by a typographic link, separated by a
single rule per row. Two- or three-column grid. Replaces the
"icon-card grid" reflex entirely.

### Emergency band

Full `bg-brand` band with eyebrow + 4xl headline + body, then a phone
number rendered as a monospace pill on `bg-surface` with `text-brand-deep`,
plus a quieter WhatsApp link. This is the only place the saffron
accent appears against `bg-brand` (used for the eyebrow only).

### Eyebrow

`.eyebrow` utility — small caps, wide tracking, semibold, `ink-mute`.
Drops uppercase and tightens tracking under Hindi. Used to label every
section. The cheap shortcut for hierarchy without bumping size.

### Skip link

Keyboard-focusable skip link in the locale layout, hidden until
focused, lands the visitor on `#main`. Required.

## Motion

- Durations: `120–240ms` for state changes, `300–500ms` for entrances.
- Easing: ease-out exponential family (`cubic-bezier(0.22, 1, 0.36, 1)`
  or steeper). No bounce, no elastic, no spring.
- Never animate layout properties (width, height, top, left, padding).
  Animate `opacity` and `transform` only.
- Reduced-motion media query collapses all animation/transition to
  ~0ms. Already wired in `globals.css`.

## Forbidden in this project

The shared impeccable bans apply (side-stripe borders, gradient text,
glassmorphism, hero-metric template, identical card grids, modal as
first thought, em dashes, decorative copy). On top of those:

- **Pure `#fff` and `#000`.** Caught in review.
- **The teal/aqua medical palette.** No exceptions.
- **Stock photography of doctors and patients.** Real photography only,
  shot on-site, or no photography at all.
- **Decorative gradients.** No background gradients; no text gradients;
  no gradient borders. The sole permissible gradient is a subtle
  photographic vignette layer over real images.
- **Floating action buttons** (the WhatsApp/phone bubbles common on
  Indian sites). The header carries the emergency call already; a
  floating circle competes with it and looks low-rent.
- **Auto-playing carousels** of any kind. If two pieces of content
  compete, pick one or stack them.
- **Sentence-case Hindi headlines transliterated from English copy.**
  Hindi is composed in Hindi; not translated word-for-word from the
  English brief.

## Implementation notes

- All tokens are exposed as Tailwind v4 utilities via `@theme` in
  `app/globals.css`. Use `bg-brand`, `text-ink-mute`, `border-rule`,
  etc., directly. Do not introduce parallel CSS variables.
- Custom utilities (`.container-wide`, `.eyebrow`, `.rule-bottom`,
  `.rule-top`) live inside `@layer components`. Add new utilities
  there only when a pattern recurs three times across the codebase.
- Fonts are loaded by `next/font/google` in `lib/fonts.ts` and applied
  via `fontVariables` on the `<html>` tag. Do not add new families
  without a documented reason and a fallback chain.

## Versioning

Treat this file as the design source of truth alongside
`app/globals.css`. When the tokens change, update both in the same
commit. When patterns ossify into reusable components, document them
here before extracting code (`$impeccable extract`).
