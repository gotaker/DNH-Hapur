import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { site } from '@/lib/site';

/**
 * Contact form sink.
 *
 * Sends the inquiry to the institution's enquiry mailbox via Resend if
 * RESEND_API_KEY is configured. In development, when no key is present,
 * we log the payload to the server console so the form still works
 * end-to-end without external configuration.
 */
export async function POST(request: Request) {
  const data = await request.formData();

  // Honeypot — silently accept so bots stop retrying.
  const honeypot = data.get('website');
  if (typeof honeypot === 'string' && honeypot.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = strField(data, 'name');
  const email = strField(data, 'email');
  const phone = strField(data, 'phone');
  const topic = strField(data, 'topic');
  const message = strField(data, 'message');

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: 'missing fields' }, { status: 400 });
  }

  // Basic email shape check; rate-limiting and CAPTCHA come in phase 9.
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid email' }, { status: 400 });
  }

  const subject = `Inquiry — ${topic || 'general'} — ${name}`;
  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || '—'}`,
    `Topic: ${topic || '—'}`,
    '',
    message,
  ];
  const text = lines.join('\n');

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? site.email;

  if (!apiKey) {
    console.log('[contact:dev]', { name, email, phone, topic, message });
    return NextResponse.json({ ok: true, dev: true });
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `Dev Nandini Website <noreply@${new URL(site.url).hostname}>`,
      to: [to],
      replyTo: email,
      subject,
      text,
    });
  } catch (err) {
    console.error('[contact] resend failed', err);
    return NextResponse.json({ ok: false, error: 'send failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

function strField(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}
