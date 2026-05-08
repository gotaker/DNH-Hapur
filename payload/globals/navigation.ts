import type { GlobalConfig } from 'payload';
import { anyone, authenticated } from '../access';

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: { read: anyone, update: authenticated },
  fields: [
    {
      name: 'primary',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', localized: true, required: true },
        { name: 'href', type: 'text', required: true },
        {
          name: 'children',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', localized: true, required: true },
            { name: 'href', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'footer',
      type: 'array',
      fields: [
        { name: 'heading', type: 'text', localized: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', localized: true, required: true },
            { name: 'href', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
};
