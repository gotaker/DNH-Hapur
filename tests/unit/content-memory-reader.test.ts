import { describe, it, expect } from 'vitest';
import { createMemoryReader } from '@/lib/content/memory-reader';
import type { BilingualDoctorRecord } from '@/lib/content/types';

const drVimlesh: BilingualDoctorRecord = {
  id: 'd1',
  slug: 'vimlesh-sharma',
  name: { en: 'Dr. Vimlesh Sharma', hi: 'डॉ. विमलेश शर्मा' },
  qualifications: 'MBBS, MD (Obs & Gyn)',
  specialty: {
    en: 'IVF and Reproductive Medicine',
    hi: 'आईवीएफ और प्रजनन चिकित्सा',
  },
  departments: [{ id: 'dep-ivf', slug: 'ivf', name: 'IVF & Reproductive Medicine' }],
  languages: { en: ['Hindi', 'English'], hi: ['हिन्दी', 'अंग्रेज़ी'] },
  opdDays: { en: 'Mon–Sat', hi: 'सोम–शनि' },
  bio: { en: 'leads the centre', hi: 'केंद्र का नेतृत्व' },
  registration: null,
  image: null,
};

const drSanjay: BilingualDoctorRecord = {
  id: 'd2',
  slug: 'sanjay-rai',
  name: { en: 'Dr. Sanjay Rai', hi: 'डॉ. संजय राय' },
  qualifications: 'MBBS, MS, MCh',
  specialty: { en: 'Neurosurgery', hi: 'न्यूरोसर्जरी' },
  departments: [{ id: 'dep-ns', slug: 'neurosurgery', name: 'Neurosurgery' }],
  languages: { en: ['Hindi'], hi: ['हिन्दी'] },
  opdDays: { en: 'Tue, Thu', hi: 'मंगल, गुरु' },
  bio: { en: 'cranial + spinal', hi: 'क्रेनियल और स्पाइनल' },
  registration: null,
  image: null,
};

describe('createMemoryReader — Doctor surface', () => {
  it('getDoctor returns Reader-resolved record for the given locale', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh] });
    const result = await reader.getDoctor('vimlesh-sharma', 'hi');
    expect(result).not.toBeNull();
    expect(result?.name).toBe('डॉ. विमलेश शर्मा');
    expect(result?.specialty).toBe('आईवीएफ और प्रजनन चिकित्सा');
    expect(result?.languages).toEqual(['हिन्दी', 'अंग्रेज़ी']);
  });

  it('getDoctor resolves the English locale when locale=en', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh] });
    const result = await reader.getDoctor('vimlesh-sharma', 'en');
    expect(result?.name).toBe('Dr. Vimlesh Sharma');
    expect(result?.opdDays).toBe('Mon–Sat');
  });

  it('getDoctor returns null for an unknown slug', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh] });
    const result = await reader.getDoctor('nobody', 'en');
    expect(result).toBeNull();
  });

  it('listDoctors returns all doctors in fixture order, locale-resolved', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh, drSanjay] });
    const result = await reader.listDoctors('hi');
    expect(result).toHaveLength(2);
    expect(result[0]?.name).toBe('डॉ. विमलेश शर्मा');
    expect(result[1]?.name).toBe('डॉ. संजय राय');
  });

  it('listDoctors returns an empty array when no doctors fixture is supplied', async () => {
    const reader = createMemoryReader({});
    const result = await reader.listDoctors('en');
    expect(result).toEqual([]);
  });

  it('getDoctorsByDepartment filters by department slug', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh, drSanjay] });
    const result = await reader.getDoctorsByDepartment('neurosurgery', 'en');
    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe('sanjay-rai');
  });

  it('getDoctorsByDepartment returns empty array when no doctor matches', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh] });
    const result = await reader.getDoctorsByDepartment('cardiology', 'en');
    expect(result).toEqual([]);
  });

  it('listDoctorSlugs returns slugs in fixture order (slug is not localised)', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh, drSanjay] });
    const result = await reader.listDoctorSlugs();
    expect(result).toEqual(['vimlesh-sharma', 'sanjay-rai']);
  });

  it('withAllLocales().getDoctor returns the bilingual record', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh] });
    const result = await reader.withAllLocales().getDoctor('vimlesh-sharma');
    expect(result).not.toBeNull();
    expect(result?.name).toEqual({
      en: 'Dr. Vimlesh Sharma',
      hi: 'डॉ. विमलेश शर्मा',
    });
    expect(result?.specialty.hi).toBe('आईवीएफ और प्रजनन चिकित्सा');
  });

  it('withAllLocales().getDoctor returns null for an unknown slug', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh] });
    const result = await reader.withAllLocales().getDoctor('nobody');
    expect(result).toBeNull();
  });
});
