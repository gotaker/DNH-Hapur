import type { Localized } from './types';

/**
 * Institutional leadership and trustees, sourced from the legacy
 * roster on dnhhapur.com. Names are transliterated; roles are left
 * unset where the legacy site did not publish them — the institution
 * must confirm titles before launch.
 */
export interface LeadershipMember {
  slug: string;
  name: Localized<string>;
  role?: Localized<string>;
  image: string;
}

export const leadership: LeadershipMember[] = [
  {
    slug: 'shubham-sharma',
    name: { en: 'Mr. Shubham Sharma', hi: 'श्री शुभम शर्मा' },
    image: '/images/leadership/shubham-sharma.jpg',
  },
  {
    slug: 's-g-sharma',
    name: { en: 'Mr. S. G. Sharma', hi: 'श्री एस. जी. शर्मा' },
    image: '/images/leadership/s-g-sharma.jpg',
  },
  {
    slug: 'mukesh-sharma',
    name: { en: 'Mr. Mukesh Sharma', hi: 'श्री मुकेश शर्मा' },
    image: '/images/leadership/mukesh-sharma.jpg',
  },
  {
    slug: 'dushyant-tyagi',
    name: { en: 'Mr. Dushyant Tyagi', hi: 'श्री दुष्यंत त्यागी' },
    image: '/images/leadership/dushyant-tyagi.jpg',
  },
  {
    slug: 'deepak-chaudhary',
    name: { en: 'Mr. Deepak Chaudhary', hi: 'श्री दीपक चौधरी' },
    image: '/images/leadership/deepak-chaudhary.jpg',
  },
];
