import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

/**
 * Next 16 renamed the global request-interception convention from
 * `middleware` to `proxy`. The function shape and the `config.matcher`
 * export are unchanged; only the file name and runtime semantics differ.
 * See: https://nextjs.org/docs/messages/middleware-to-proxy
 */
const intl = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const response = intl(request);

  // Railway's edge forwards public 443 traffic to the container's internal
  // port (e.g. 8080), and that port leaks into next-intl's redirect Location
  // because Next builds redirect URLs from the incoming host header. When the
  // request arrived over HTTPS, any non-default port in the redirect target
  // is wrong — strip it so `/` → `/hi` lands on the public domain.
  const location = response.headers.get('location');
  if (location) {
    try {
      const url = new URL(location);
      const xfProto = request.headers.get('x-forwarded-proto');
      const isSecure = xfProto === 'https' || request.nextUrl.protocol === 'https:';
      if (url.port && (isSecure ? url.port !== '443' : url.port !== '80')) {
        url.port = '';
        response.headers.set('location', url.toString());
      }
    } catch {
      // Relative Location header — nothing to normalise.
    }
  }

  return response;
}

export const config = {
  // All routes except API, Next internals, Payload admin, and static files.
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
