import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * Next 16 renamed the global request-interception convention from
 * `middleware` to `proxy`. The function shape and the `config.matcher`
 * export are unchanged; only the file name and runtime semantics differ.
 * See: https://nextjs.org/docs/messages/middleware-to-proxy
 */
export default createMiddleware(routing);

export const config = {
  // All routes except API, Next internals, Payload admin, and static files.
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
