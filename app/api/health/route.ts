import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Liveness probe used by Railway's healthcheck and by docker-compose.
 * Keep this fast and dependency-free so a slow database does not kill the
 * web pod when the rest of the app is still responsive.
 */
export function GET() {
  return NextResponse.json(
    { ok: true, service: 'dnh-web', ts: new Date().toISOString() },
    { headers: { 'cache-control': 'no-store' } },
  );
}
