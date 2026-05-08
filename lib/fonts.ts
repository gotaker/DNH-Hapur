import { Tiro_Devanagari_Hindi, Hind } from 'next/font/google';

/**
 * Tiro Devanagari Hindi — display face. Designed by John Hudson for sustained
 * reading of Hindi; ships a matched Latin cut. Used at H1/H2 sizes.
 */
export const tiro = Tiro_Devanagari_Hindi({
  subsets: ['devanagari', 'latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display-loaded',
  preload: true,
});

/**
 * Hind — body face. Indian Type Foundry's bilingual family with matched
 * Devanagari and Latin design. The default sans for the entire site.
 */
export const hind = Hind({
  subsets: ['devanagari', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans-loaded',
  preload: true,
});

export const fontVariables = `${tiro.variable} ${hind.variable}`;
