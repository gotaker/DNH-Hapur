import { Spectral, Tiro_Devanagari_Hindi, Hind } from 'next/font/google';

/**
 * Spectral — display face. A serif by Production Type, used the same way
 * Mass General uses it: light-weight headings (h1/h2/h3) on a generous
 * grid. Latin only; Devanagari falls through to Tiro below.
 */
export const spectral = Spectral({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display-loaded',
  preload: true,
});

/**
 * Tiro Devanagari Hindi — Devanagari display fallback. Spectral has no
 * Devanagari coverage, so Hindi headings render through Tiro via the
 * cascade in `--font-display`. Loaded so Hindi is consistent across
 * devices, not left to the system.
 */
export const tiro = Tiro_Devanagari_Hindi({
  subsets: ['devanagari', 'latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display-deva-loaded',
  preload: false,
});

/**
 * Hind — Devanagari body fallback. The body type is Helvetica Neue (system
 * stack, OS-provided), but Helvetica Neue has no Devanagari, so Hind is
 * loaded as a matched Devanagari companion for Hindi body copy.
 */
export const hind = Hind({
  subsets: ['devanagari', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans-deva-loaded',
  preload: false,
});

export const fontVariables = `${spectral.variable} ${tiro.variable} ${hind.variable}`;
