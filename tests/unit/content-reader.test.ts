import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Payload } from 'payload';
import { createReader } from '@/lib/content/reader';

/**
 * Build a Payload-shaped fake whose `find` returns the queued response.
 * Tests assert against `find.mock.calls` to verify the query shape.
 */
function fakePayload(response: { docs: unknown[] }): Payload {
  const find = vi.fn().mockResolvedValue(response);
  return { find } as unknown as Payload;
}

const drVimleshDoc = {
  id: 'd1',
  slug: 'vimlesh-sharma',
  name: 'Dr. Vimlesh Sharma',
  qualifications: 'MBBS, MD (Obs & Gyn)',
  specialty: 'IVF and Reproductive Medicine',
  departments: [{ id: 'dep-ivf', slug: 'ivf', name: 'IVF & Reproductive Medicine' }],
  languages: [{ item: 'Hindi' }, { item: 'English' }],
  opdDays: 'Mon–Sat',
  bio: { type: 'lexical' },
  registration: null,
  image: null,
};

describe('createReader — Doctor surface', () => {
  it('getDoctor queries Payload with collection, slug filter, locale, and depth=1', async () => {
    const payload = fakePayload({ docs: [drVimleshDoc] });
    const reader = createReader(payload);

    await reader.getDoctor('vimlesh-sharma', 'hi');

    const find = payload.find as unknown as ReturnType<typeof vi.fn>;
    expect(find).toHaveBeenCalledWith({
      collection: 'doctors',
      where: { slug: { equals: 'vimlesh-sharma' } },
      locale: 'hi',
      depth: 1,
      limit: 1,
    });
  });

  it('getDoctor maps Payload doc to Reader-resolved DoctorRecord', async () => {
    const payload = fakePayload({ docs: [drVimleshDoc] });
    const reader = createReader(payload);

    const result = await reader.getDoctor('vimlesh-sharma', 'en');

    expect(result).toMatchObject({
      id: 'd1',
      slug: 'vimlesh-sharma',
      name: 'Dr. Vimlesh Sharma',
      specialty: 'IVF and Reproductive Medicine',
      languages: ['Hindi', 'English'],
      opdDays: 'Mon–Sat',
    });
  });

  it('getDoctor returns null when Payload returns no docs', async () => {
    const payload = fakePayload({ docs: [] });
    const reader = createReader(payload);

    const result = await reader.getDoctor('nobody', 'en');
    expect(result).toBeNull();
  });

  it('listDoctors queries with no slug filter and depth=1', async () => {
    const payload = fakePayload({ docs: [drVimleshDoc] });
    const reader = createReader(payload);

    await reader.listDoctors('hi');

    const find = payload.find as unknown as ReturnType<typeof vi.fn>;
    expect(find).toHaveBeenCalledWith({
      collection: 'doctors',
      locale: 'hi',
      depth: 1,
      limit: 1000,
    });
  });

  it('getDoctorsByDepartment filters by department relationship slug', async () => {
    const payload = fakePayload({ docs: [drVimleshDoc] });
    const reader = createReader(payload);

    await reader.getDoctorsByDepartment('ivf', 'en');

    const find = payload.find as unknown as ReturnType<typeof vi.fn>;
    expect(find).toHaveBeenCalledWith({
      collection: 'doctors',
      where: { 'departments.slug': { equals: 'ivf' } },
      locale: 'en',
      depth: 1,
      limit: 1000,
    });
  });

  it('listDoctorSlugs queries with locale=en, depth=0, returns slug strings only', async () => {
    const payload = fakePayload({
      docs: [{ slug: 'vimlesh-sharma' }, { slug: 'sanjay-rai' }],
    });
    const reader = createReader(payload);

    const result = await reader.listDoctorSlugs();

    const find = payload.find as unknown as ReturnType<typeof vi.fn>;
    expect(find).toHaveBeenCalledWith({
      collection: 'doctors',
      locale: 'en',
      depth: 0,
      limit: 1000,
      select: { slug: true },
    });
    expect(result).toEqual(['vimlesh-sharma', 'sanjay-rai']);
  });

  it('withAllLocales().getDoctor queries with locale=all and returns bilingual maps', async () => {
    const bilingualDoc = {
      ...drVimleshDoc,
      name: { en: 'Dr. Vimlesh Sharma', hi: 'डॉ. विमलेश शर्मा' },
      specialty: {
        en: 'IVF and Reproductive Medicine',
        hi: 'आईवीएफ और प्रजनन चिकित्सा',
      },
      languages: {
        en: [{ item: 'Hindi' }, { item: 'English' }],
        hi: [{ item: 'हिन्दी' }, { item: 'अंग्रेज़ी' }],
      },
      opdDays: { en: 'Mon–Sat', hi: 'सोम–शनि' },
      bio: { en: { type: 'lexical' }, hi: { type: 'lexical' } },
    };
    const payload = fakePayload({ docs: [bilingualDoc] });
    const reader = createReader(payload);

    const result = await reader.withAllLocales().getDoctor('vimlesh-sharma');

    const find = payload.find as unknown as ReturnType<typeof vi.fn>;
    expect(find).toHaveBeenCalledWith({
      collection: 'doctors',
      where: { slug: { equals: 'vimlesh-sharma' } },
      locale: 'all',
      depth: 1,
      limit: 1,
    });
    expect(result?.name).toEqual({
      en: 'Dr. Vimlesh Sharma',
      hi: 'डॉ. विमलेश शर्मा',
    });
    expect(result?.languages.en).toEqual(['Hindi', 'English']);
    expect(result?.languages.hi).toEqual(['हिन्दी', 'अंग्रेज़ी']);
  });
});

describe('getReader — production singleton', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  // Without these unmocks, vi.doMock state from the smoke test below
  // survives vi.resetModules() and contaminates any later describe block
  // (or test file) that imports `payload` or `@payload-config` — verified
  // by an out-of-tree probe before this cleanup was added.
  afterEach(() => {
    vi.doUnmock('payload');
    vi.doUnmock('@payload-config');
  });

  it('returns the same Promise across calls (cached)', async () => {
    vi.doMock('payload', () => ({
      getPayload: vi.fn().mockResolvedValue({ find: vi.fn() }),
    }));
    vi.doMock('@payload-config', () => ({ default: {} }));

    const { getReader } = await import('@/lib/content');

    const a = getReader();
    const b = getReader();

    expect(a).toBe(b);

    const { getPayload } = await import('payload');
    expect(getPayload).toHaveBeenCalledTimes(1);
  });
});
