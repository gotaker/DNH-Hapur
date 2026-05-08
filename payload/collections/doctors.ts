import type { CollectionConfig } from 'payload';
import { anyone, authenticated } from '../access';

export const Doctors: CollectionConfig = {
  slug: 'doctors',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'specialty', 'updatedAt'] },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'qualifications', type: 'text', required: true },
    { name: 'specialty', type: 'text', required: true, localized: true },
    {
      name: 'departments',
      type: 'relationship',
      relationTo: 'departments',
      hasMany: true,
    },
    {
      name: 'languages',
      type: 'array',
      localized: true,
      fields: [{ name: 'item', type: 'text', required: true }],
    },
    { name: 'opdDays', type: 'text', localized: true },
    { name: 'bio', type: 'richText', localized: true },
    { name: 'registration', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
};
