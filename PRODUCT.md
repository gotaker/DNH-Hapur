# PRODUCT.md — Dev Nandini Hospital & Medical College

> Source of truth for who we are, who we serve, and how the institution
> sounds. Read by `$impeccable` before any design work; read by humans
> before they brief copywriters, photographers, or contractors.

## Register

**brand**

This is an institutional site, not a software product. The page _is_ the
product. Marketing-led pages, long-form institutional content, and
trust-building surfaces dominate; in-app tooling is secondary and defers
to the brand register.

The interactive surfaces we _do_ ship (locale switching, appointment
booking, patient portals in later phases) are dressed in the brand
language, not in dashboard chrome.

## Identity

- **Legal name:** Dev Nandini Hospital & Medical College
- **Hindi:** देव नंदिनी अस्पताल और चिकित्सा महाविद्यालय
- **Short name:** Dev Nandini · देव नंदिनी
- **Abbreviation:** DNH
- **Established:** 2014
- **Location:** Near Railway Crossing, Garh Road, Hapur, Uttar Pradesh, India
- **Audience belt:** Western Uttar Pradesh — Hapur, Ghaziabad, Meerut,
  Bulandshahr, Moradabad, the surrounding rural districts.

## Users

The site is read by people in three different states of mind. Every
page must answer the foreground audience first; the others are
subordinate.

1. **The worried family member.** A relative is unwell, possibly
   serious. They want to know whether we can handle their case, what
   it will cost in human terms, and whether the place will treat them
   with dignity. They scroll on a phone, often in poor light, often in
   Hindi. **Foreground audience.** Every page assumes them by default.

2. **The student and their parents.** Looking at MBBS, post-graduate,
   nursing, or paramedical programs. They want recognition (NMC, the
   affiliating university), pass rates, faculty calibre, hostel and
   campus facts, and a frank fee structure. They read in English more
   often than Hindi.

3. **The professional visitor.** Other doctors checking referral
   feasibility, insurers checking empanelment, government and
   accreditation auditors, journalists. They want facts dense and
   verifiable. They are a distant third in attention but they fact-check
   everything; sloppy claims here cost the institution.

A fourth category — donors, alumni, government partners — exists but
piggybacks on (3); we do not design for them separately.

## Product purpose

The site is the institution's first room. Visitors should leave with
two things at minimum:

- A clear sense that this is a serious, accredited tertiary-care
  hospital and medical college — not a clinic with a website.
- One or zero clicks to the action they came for: emergency phone,
  appointment, department, doctor, admissions, fees.

Everything else is secondary.

## Brand

### Voice — three principles, ranked

1. **Plainspoken authority.** We say what we treat, who treats it, and
   what it costs. Sentences are short. Numbers are exact. Hedges
   ("world-class", "state-of-the-art", "leading", "trusted by
   thousands") are forbidden.
2. **Quiet seriousness.** This is medicine, not retail. No exclamation
   marks, no "Welcome!", no marketing bromides. Warmth comes from
   precision and respect, not adjectives.
3. **Bilingual symmetry.** Hindi is not a translation of English.
   Hindi is the default for the institutional voice — written first,
   read first, displayed first when both are present. English is
   parallel and complete, never an afterthought.

### Anti-references

We are aware these patterns dominate Indian hospital websites and
explicitly reject them:

- **Stock-photo cliché.** Smiling doctor in scrubs holding a clipboard
  in front of a window. Family laughing in a sunlit consultation room.
  Globally recognisable Shutterstock pull. Forbidden.
- **Trust-collage walls.** "Why choose us" sections that list eight
  vague virtues with icons (Caring, Innovative, Patient-centric…).
  Forbidden.
- **The teal-and-aqua medical palette.** Saturated cyan, mint, white.
  Forbidden as the brand body color. (We use a deep, committed hospital
  blue instead — see DESIGN.md.)
- **Hindi as caption.** A Devanagari subtitle under a larger English
  title. Forbidden. Either Hindi leads, or the two languages share
  weight, or we render only the active locale.
- **The hero-metric template.** Big number + small label + supporting
  stats. ("250+ doctors. 30+ specialties. 1M patients.") Forbidden as
  a hero treatment. We may cite numbers; we do not theatricalise them.
- **Marketing slogans.** "Your health, our mission." "Where care meets
  excellence." "Healing with heart." Forbidden in every language.

### Reference notes (positive)

The institutional voice we aim for sits closer to:

- A well-set Indian newspaper masthead — typographic, dense, calm.
- A government gazette or university viewbook — formal but not
  bureaucratic; trustworthy because it is exact.
- A hospital wayfinding system designed with care — large, legible,
  bilingual, signage-grade.

## Strategic principles

These are not aspirations. They are constraints on every design
decision; if a decision violates one, the decision is wrong.

1. **Emergency is the spine.** Every page surfaces the emergency phone
   number within two screen-heights. The phone is callable on
   mobile; the number is rendered in monospaced figures so it is
   recognisable as a phone number even glanced. The phone is never
   theatricalised — no red banner, no flashing — but it is never
   buried.
2. **Hindi-first, English-equal.** Hindi (`hi`) is the default locale.
   URLs always carry the prefix on both languages so neither feels
   secondary. The locale switcher is in the masthead, not buried in
   the footer. Devanagari has its own line-height, its own letter-
   spacing, its own display face — it is set, not transliterated.
3. **No medical claims we cannot defend.** Specialties, accreditations,
   doctor credentials, and outcome statistics are auditable. If we do
   not have a number, we do not invent a category for one.
4. **Performance is a brand surface.** A patient on a 3G phone in a
   power-cut waiting room must reach the emergency number in under
   two seconds. Pages render server-side, fonts are preloaded, images
   are lean and locally hosted. A heavy page is a brand failure.
5. **Accessibility is non-negotiable.** WCAG AA contrast minimum, AAA
   for body copy. Keyboard-reachable, screen-reader-labelled, with a
   visible skip link. Reduced-motion respected. We treat the elderly
   patient on the family's old phone as our reference user, not a
   tester on a Retina display.
6. **The page is the product.** No SaaS-style chrome — no sidebars
   that exist for nav balance, no dashboard widgets, no hero metrics,
   no card grids assembled out of habit. Every block earns its line
   weight.

## Tone in copy

- Short sentences. Verbs over adjectives.
- Hindi: respectful but not formal-archaic. आप-form, present tense
  preferred.
- English: Indian English conventions (e.g. "tertiary care centre",
  "accident & emergency"), not Americanisms.
- No em dashes anywhere. Use commas, colons, semicolons, periods, or
  parentheses. (Also no `--`.)
- No exclamation marks except inside quoted speech.
- Numerals: figures for counts (`12 specialties`), spelled-out for
  small social numbers (`one institution`, `two languages`).

## Out of scope (for the brand surface)

- Doctor self-service apps, EMR portals, billing dashboards — these
  exist but live behind authenticated routes and adopt the **product**
  register when built. They are documented separately when they ship.
- E-commerce. We do not sell anything on this site. Booking and
  payment are pre-care utilities, not retail flows.

## Versioning

This file is read on every `$impeccable` invocation. Edit it
deliberately. Major shifts (audience, register, voice principles)
should be discussed before they land; small clarifications can be
amended freely.
