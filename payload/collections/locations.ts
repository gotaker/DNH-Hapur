import type { CollectionConfig } from 'payload';
import { anyone, authenticated } from '../access';

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'kind'] },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'main',
      options: [
        { label: 'Main hospital', value: 'main' },
        { label: 'College', value: 'college' },
        { label: 'OPD wing', value: 'opd' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'address', type: 'textarea', localized: true, required: true },
    {
      name: 'phones',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', localized: true, required: true },
        { name: 'number', type: 'text', required: true },
      ],
    },
    { name: 'hours', type: 'text', localized: true },
    { name: 'mapUrl', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
};
