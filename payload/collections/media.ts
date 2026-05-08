import type { CollectionConfig } from 'payload';
import { anyone, authenticated } from '../access';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'uploads',
    imageSizes: [
      { name: 'thumbnail', width: 480, height: 600, position: 'centre' },
      { name: 'card', width: 1024, height: 1280, position: 'centre' },
      { name: 'wide', width: 1920, height: undefined, position: 'centre' },
    ],
    mimeTypes: ['image/*'],
    focalPoint: true,
  },
  admin: { useAsTitle: 'alt' },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'alt',
      label: 'Alt text',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'A short literal description, in the active locale.' },
    },
    {
      name: 'credit',
      type: 'text',
      admin: { description: 'Photographer or source credit, if any.' },
    },
  ],
};
