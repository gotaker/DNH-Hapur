import { describe, it, expect } from 'vitest';
import en from '@/content/messages/en.json';
import hi from '@/content/messages/hi.json';

/**
 * The two locale catalogs must stay in lockstep. A missing translation
 * shouldn't fail silently at runtime; the test suite enforces parity.
 */
function flatten(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => {
    const next = prefix ? `${prefix}.${k}` : k;
    return typeof v === 'object' && v !== null ? flatten(v, next) : [next];
  });
}

describe('locale message catalogs', () => {
  it('have identical key sets', () => {
    const enKeys = flatten(en).sort();
    const hiKeys = flatten(hi).sort();
    expect(hiKeys).toEqual(enKeys);
  });

  it('use Devanagari for the Hindi site name', () => {
    expect(hi.site.name).toMatch(/[\u0900-\u097F]/);
  });

  it('have non-empty values everywhere', () => {
    for (const [path, value] of Object.entries({ en, hi })) {
      const flat = JSON.stringify(value);
      expect(flat, `${path} catalog must not contain empty strings`).not.toMatch(/:\s*""/);
    }
  });
});
