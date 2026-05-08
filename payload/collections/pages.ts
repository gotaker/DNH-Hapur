import type { CollectionConfig } from 'payload';
import { anyone, authenticated } from '../access';

/**
 * Pages — block-based composer for editorial pages outside the
 * fixed templates (e.g. accreditations, careers, NABH commitments).
 * Phase 5 ships the structural shape; the block components grow as
 * editors ask for them.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'updatedAt'] },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, localized: true, index: true },
    { name: 'lede', type: 'textarea', localized: true },
    {
      name: 'blocks',
      type: 'blocks',
      blocks: [
        {
          slug: 'richText',
          fields: [{ name: 'content', type: 'richText', localized: true }],
        },
        {
          slug: 'callToAction',
          fields: [
            { name: 'heading', type: 'text', localized: true, required: true },
            { name: 'body', type: 'textarea', localized: true },
            { name: 'href', type: 'text' },
            { name: 'label', type: 'text', localized: true },
          ],
        },
        {
          slug: 'imageWithText',
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media' },
            { name: 'heading', type: 'text', localized: true },
            { name: 'body', type: 'richText', localized: true },
          ],
        },
        {
          slug: 'faq',
          fields: [
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'q', type: 'text', localized: true, required: true },
                { name: 'a', type: 'textarea', localized: true, required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
};
