import { describe, it, expect } from 'vitest';
import { site } from '@/lib/site';

describe('site metadata', () => {
  it('exposes both locales for content-bearing fields', () => {
    expect(site.name.en.length).toBeGreaterThan(0);
    expect(site.name.hi.length).toBeGreaterThan(0);
    expect(site.address.en).toContain('Hapur');
    expect(site.address.hi).toContain('हापुड़');
  });

  it('emergency phone is included in the public phone list', () => {
    expect(site.phones).toContain(site.emergencyPhone);
  });

  it('whatsapp number is the international form (no leading zero)', () => {
    expect(site.whatsapp.startsWith('91')).toBe(true);
    expect(site.whatsapp.startsWith('0')).toBe(false);
  });
});
