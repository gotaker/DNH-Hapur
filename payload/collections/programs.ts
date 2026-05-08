import type { CollectionConfig } from 'payload';
import { anyone, authenticated } from '../access';

export const Programs: CollectionConfig = {
  slug: 'programs',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'level', 'intake'] },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, localized: true, index: true },
    {
      name: 'level',
      type: 'select',
      required: true,
      options: [
        { label: 'Undergraduate', value: 'undergraduate' },
        { label: 'Postgraduate', value: 'postgraduate' },
        { label: 'Fellowship', value: 'fellowship' },
        { label: 'Paramedical / Nursing', value: 'paramedical' },
        { label: 'Training / short course', value: 'training' },
      ],
    },
    { name: 'duration', type: 'text', localized: true, required: true },
    { name: 'intake', type: 'number' },
    {
      name: 'eligibility',
      type: 'array',
      localized: true,
      fields: [{ name: 'item', type: 'text', required: true }],
    },
    { name: 'feeIndicative', type: 'text', localized: true },
    { name: 'accreditation', type: 'text' },
    { name: 'summary', type: 'textarea', localized: true, required: true },
    { name: 'longform', type: 'richText', localized: true },
  ],
};
