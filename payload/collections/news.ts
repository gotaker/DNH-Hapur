import type { CollectionConfig } from 'payload';
import { anyone, authenticated } from '../access';

export const News: CollectionConfig = {
  slug: 'news',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'category', 'publishedAt'] },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'category', type: 'text', localized: true },
    { name: 'publishedAt', type: 'date', required: true },
    { name: 'excerpt', type: 'textarea', localized: true },
    { name: 'body', type: 'richText', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
};
