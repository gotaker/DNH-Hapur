/**
 * Site-wide metadata constants. CMS-driven values move into Payload globals
 * in phase 5; until then this file is the single source of truth so links and
 * footer rendering stay consistent.
 */
export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  name: {
    en: 'Dev Nandini Hospital & Medical College',
    hi: 'देव नंदिनी अस्पताल और चिकित्सा महाविद्यालय',
  },
  shortName: {
    en: 'Dev Nandini',
    hi: 'देव नंदिनी',
  },
  phones: ['07500246422', '09219429200'],
  emergencyPhone: '07500246422',
  email: 'enquiry@dnhhapur.com',
  address: {
    en: 'Near Railway Crossing, Garh Road, Hapur, Uttar Pradesh, India',
    hi: 'रेलवे क्रॉसिंग के पास, गढ़ रोड, हापुड़, उत्तर प्रदेश, भारत',
  },
  established: 2014,
  whatsapp: '917500246422',
} as const;

export type Site = typeof site;
