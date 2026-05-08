import type { CollectionConfig } from 'payload';
import { anyone, authenticated } from '../access';

/**
 * Faculty is intentionally separate from clinical doctors. Some clinicians
 * teach (linked through `clinicalDoctor`); some teaching faculty do not see
 * patients. The medical college also has guest faculty and emeritus rolls
 * which do not appear on the clinical roster.
 */
export const Faculty: CollectionConfig = {
  slug: 'faculty',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'designation', 'department'] },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'designation', type: 'text', localized: true },
    { name: 'qualifications', type: 'text' },
    {
      name: 'departments',
      type: 'relationship',
      relationTo: 'departments',
      hasMany: true,
    },
    {
      name: 'clinicalDoctor',
      type: 'relationship',
      relationTo: 'doctors',
      hasMany: false,
      admin: {
        description: 'Optional link to the clinical roster, when this faculty also sees patients.',
      },
    },
    { name: 'bio', type: 'richText', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
};
