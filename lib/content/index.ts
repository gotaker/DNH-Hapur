import { getPayload } from 'payload';
import config from '@payload-config';
import { createReader } from './reader';
import type { ContentReader } from './reader';

/**
 * Lazy-initialised production singleton. The Promise is cached so every
 * caller awaits the same Reader instance (and the same underlying Payload
 * client). Safe under React Server Components: each request fans out to
 * many Reader calls, all going through this single Payload connection.
 *
 * Single-threaded JS guarantees the `cached = ...` assignment in `getReader`
 * completes before any other call observes the slot, so concurrent first
 * callers cannot race into a double `getPayload`.
 */
let cached: Promise<ContentReader> | null = null;

export function getReader(): Promise<ContentReader> {
  if (cached === null) {
    cached = getPayload({ config }).then(createReader);
  }
  return cached;
}

// Barrel re-exports — every consumer imports from '@/lib/content'.
export type {
  ContentReader,
  BilingualContentReader,
} from './reader';
export { createReader } from './reader';
export { createMemoryReader } from './memory-reader';
export type { MemoryFixtures } from './memory-reader';
export type {
  DoctorRecord,
  BilingualDoctorRecord,
  DepartmentRecord,
  BilingualDepartmentRecord,
  DepartmentRef,
  MediaRecord,
  Locale,
} from './types';
