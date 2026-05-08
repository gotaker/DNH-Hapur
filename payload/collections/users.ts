import type { CollectionConfig } from 'payload';
import { authenticated } from '../access';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Clinical editor', value: 'clinical' },
        { label: 'Academic editor', value: 'academic' },
        { label: 'Editor', value: 'editor' },
      ],
    },
  ],
};
