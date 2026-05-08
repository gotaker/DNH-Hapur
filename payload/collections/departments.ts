import type { CollectionConfig } from 'payload';
import { anyone, authenticated } from '../access';

export const Departments: CollectionConfig = {
  slug: 'departments',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'isCenter', 'updatedAt'] },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      localized: true,
      index: true,
      admin: {
        description: 'Locale-specific URL slug, e.g. cardiology / hridya-rog-vibhag.',
      },
    },
    { name: 'shortName', type: 'text', localized: true },
    { name: 'summary', type: 'textarea', required: true, localized: true },
    {
      name: 'services',
      type: 'array',
      localized: true,
      fields: [{ name: 'item', type: 'text', required: true }],
    },
    { name: 'isCenter', type: 'checkbox', defaultValue: false, label: 'Center of Excellence' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'longform',
      type: 'richText',
      localized: true,
      admin: { description: 'Used on the department detail page.' },
    },
    {
      name: 'hod',
      type: 'relationship',
      relationTo: 'doctors',
      hasMany: false,
      label: 'Head of Department',
    },
  ],
};
