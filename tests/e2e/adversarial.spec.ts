import { expect, test } from '@playwright/test';

test.describe('adversarial api regression', () => {
  test('health endpoint rejects unsupported methods', async ({ request }) => {
    const res = await request.post('/api/health');
    expect(res.status()).toBe(405);
  });

  test('contact endpoint rejects malformed email without leaking internals', async ({ request }) => {
    const res = await request.post('/api/contact', {
      multipart: {
        name: 'Adversarial Tester',
        email: 'not-an-email',
        message: 'hello',
      },
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body).toMatchObject({ ok: false, error: 'invalid email' });

    const raw = JSON.stringify(body);
    expect(raw).not.toMatch(/stack|trace|node_modules|payload|sql|postgres/i);
  });

  test('contact honeypot accepts bot-like submissions quietly', async ({ request }) => {
    const res = await request.post('/api/contact', {
      multipart: {
        website: 'https://spam.example',
        name: 'Bot',
        email: 'bot@example.com',
        message: 'spam',
      },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('search endpoint safely handles invalid locale and injection-like query', async ({ request }) => {
    const q = `'; DROP TABLE doctors; -- <script>alert(1)</script> हृदय`;
    const res = await request.get(`/api/search?locale=xx&q=${encodeURIComponent(q)}`);
    expect(res.ok()).toBe(true);

    const body = await res.json();
    expect(body.locale).toBe('hi');
    expect(Array.isArray(body.hits)).toBe(true);
    expect(body.hits.length).toBeLessThanOrEqual(12);
  });

  test('search endpoint remains bounded under oversized query', async ({ request }) => {
    const q = 'हृदय'.repeat(5000);
    try {
      const res = await request.get(`/api/search?locale=hi&q=${encodeURIComponent(q)}`);

      // Accept either graceful app handling (200) or infrastructure
      // guardrails for oversized request lines (431/414), but never 5xx.
      expect(res.status()).toBeLessThan(500);
      expect([200, 414, 431]).toContain(res.status());

      if (res.status() === 200) {
        const body = await res.json();
        expect(Array.isArray(body.hits)).toBe(true);
        expect(body.hits.length).toBeLessThanOrEqual(12);
      }
    } catch (error) {
      // Some runtimes close the socket after 431 and Playwright surfaces it as
      // ECONNRESET. Treat as bounded rejection (not a server crash).
      const message = String(error);
      expect(message).toMatch(/ECONNRESET|Request Header Fields Too Large|431/i);
    }
  });
});
