import type { GlobalConfig } from 'payload';
import { anyone, authenticated } from '../access';

export const Settings: GlobalConfig = {
  slug: 'settings',
  access: { read: anyone, update: authenticated },
  fields: [
    { name: 'siteName', type: 'text', localized: true, required: true },
    { name: 'shortName', type: 'text', localized: true },
    { name: 'tagline', type: 'textarea', localized: true },
    { name: 'emergencyPhone', type: 'text' },
    {
      name: 'phones',
      type: 'array',
      fields: [{ name: 'number', type: 'text', required: true }],
    },
    { name: 'email', type: 'text' },
    { name: 'whatsapp', type: 'text' },
    {
      name: 'social',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'X', value: 'x' },
            { label: 'LinkedIn', value: 'linkedin' },
          ],
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
};
