import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

import { Users } from './payload/collections/users';
import { Media } from './payload/collections/media';
import { Doctors } from './payload/collections/doctors';
import { Departments } from './payload/collections/departments';
import { Programs } from './payload/collections/programs';
import { Faculty } from './payload/collections/faculty';
import { News } from './payload/collections/news';
import { Locations } from './payload/collections/locations';
import { Pages } from './payload/collections/pages';
import { Settings } from './payload/globals/settings';
import { Navigation } from './payload/globals/navigation';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Dev Nandini',
    },
  },
  collections: [Users, Media, Doctors, Departments, Programs, Faculty, News, Locations, Pages],
  globals: [Settings, Navigation],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET ?? 'dev-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URI ??
        'postgresql://dnh:dnh@localhost:5432/dnh',
    },
  }),
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'हिन्दी', code: 'hi' },
    ],
    defaultLocale: 'hi',
    fallback: true,
  },
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'payload-schema.graphql'),
  },
});
