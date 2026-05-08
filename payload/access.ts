import type { Access } from 'payload';

/**
 * Public can read everything we publish; only authenticated users (clinical
 * editors, academic editors, admins) can write. Phase 5 keeps the role model
 * simple and per-collection; richer ACLs come once the team is real.
 */
export const anyone: Access = () => true;
export const authenticated: Access = ({ req }) => Boolean(req.user);
