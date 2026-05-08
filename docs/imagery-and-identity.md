# Imagery and identity (phase 6)

This document records the deliberate placeholder strategy and the
identity rules. It is the brief the institution will use to
commission real photography in phase 6 of the production rollout.

## 1. Photography brief

We use Unsplash as a placeholder substrate, with deliberate searches
per section. Each placeholder lists the search term we used and the
intent the real photograph must preserve. Real institutional
photography replaces these in this order: hero, doctors, departments,
emergency, contact.

| Surface | Search term | Intent |
|---|---|---|
| Home / hero | "north Indian hospital corridor" | A wide, calm interior shot. Real version: the hospital's own main lobby or OPD corridor at daylight, no patients identifiable. |
| Doctors / portraits | "doctor consulting patient India" | A working portrait, not a smile-to-camera. Real version: each clinician shot in their own clinic at the same time of day for visual consistency. |
| Centers / IVF | "IVF lab embryologist" | An embryologist at the microscope, gloved hands. Real version: our own embryologist; no patient images. |
| Centers / Neurosurgery | "neurosurgery operating theatre" | A wide OT shot with theatre staff in motion. |
| Centers / NICU | "newborn intensive care unit hands" | Hands-only image of a premature baby in an incubator. Patient identity must not be discernible. |
| Centers / Joint Replacement | "orthopaedic operating theatre laminar flow" | Laminar-flow OT or post-op rehab. |
| Centers / Cardiology | "cardiac catheterisation lab" | Cath-lab with cleaning fluoroscopy frame, masked operator. |
| Department detail (default) | varies per specialty | Single mid-shot of the department's working space — not a smiling consultation. |
| Emergency | "hospital emergency entrance India" | A red-marked entrance with one ambulance. |
| Contact | "hospital exterior night India" | An exterior view of the hospital signage. |

## 2. Photography rules (real photography phase)

- One decisive photo per major section. No grids of stock photos.
- All on-camera consent forms filed with the institution before publication.
- Patients, identifiable family members, and minors require written consent.
- Skin and tonal range honest to Western UP, not whitewashed.
- No vignettes, no halos, no overlays. The photograph must hold weight on its own.
- Black-and-white treatment is allowed (and used by default for doctor portraits) only when it preserves shadow detail and skin texture.
- Aspect ratios:
  - Hero: 4:5 mobile, 16:10 desktop.
  - Department detail hero: 4:5 mobile, 16:11 desktop.
  - Doctor portrait: 4:5 fixed.
  - News card: 16:10 fixed.

## 3. Wordmark

The wordmark is delivered as a typographic SVG-rendered lockup using
the same Tiro family as the rest of the type system. Two variants:

- **Inline** — `DNH | देव नंदिनी` separated by a hairline rule. Used
  in the header and footer.
- **Stacked** — the Latin abbreviation above the Devanagari name,
  for tighter horizontal contexts. Used in the mobile drawer.

Tone variants: `ink` (default, on the warm bone surface) and `light`
(for use on the brand-deep footer). The hairline rule between the
Latin and Devanagari registers picks up the brand colour in `ink`
tone, the accent in `light` tone.

## 4. Iconography rules

- Icons earn their place. They are not added to headings.
- Permitted decorative uses across the build:
  - **Hamburger** (mobile primary nav)
  - **Accordion toggle** (× / +, CSS-rotated)
  - **Emergency dot** (the filled circle preceding the emergency phone in the utility row)
- Permitted functional uses (with `aria-hidden` and a labelled neighbour):
  - **Caret/arrow glyph** in inline link affordances (`→`)
- Banned: large rounded icons stacked above headings, icon-card grids, decorative
  hero-medical glyphs (cross, stethoscope, heart-monogram), iconified status badges.

## 5. Replacement schedule

1. **Soft launch (phase 9):** Unsplash placeholders remain.
2. **Within 30 days of launch:** doctors, hero, centres replaced with institutional photography.
3. **Within 90 days:** every department detail page has at least one real photograph; remainder rotated quarterly.
