'use client';

import { useState } from 'react';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type Labels = {
  name: string;
  email: string;
  phone: string;
  topic: string;
  topicOptions: string[];
  message: string;
  submit: string;
  thankYou: string;
  error: string;
};

type State = 'idle' | 'submitting' | 'sent' | 'error';

export function ContactForm({ labels }: { labels: Labels }) {
  const [state, setState] = useState<State>('idle');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('submitting');
    const data = new FormData(event.currentTarget);
    try {
      const res = await fetch('/api/contact', { method: 'POST', body: data });
      if (!res.ok) throw new Error('failed');
      setState('sent');
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div className="border-rule border bg-surface-mute p-8">
        <p className="text-ink text-lg leading-relaxed">{labels.thankYou}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="grid gap-1.5">
        <Label htmlFor="name">{labels.name}</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="email">{labels.email}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="phone">{labels.phone}</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="topic">{labels.topic}</Label>
        <select
          id="topic"
          name="topic"
          required
          className="block w-full bg-transparent border-0 border-b border-rule px-0 py-2.5 text-ink text-base focus:border-brand focus:outline-none"
        >
          {labels.topicOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="message">{labels.message}</Label>
        <Textarea id="message" name="message" rows={5} required />
      </div>
      {/* Honeypot — hidden from users, ignored by humans */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={state === 'submitting'}>
          {state === 'submitting' ? '…' : labels.submit}
        </Button>
        {state === 'error' ? (
          <p className="text-brand text-sm" role="alert">
            {labels.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
