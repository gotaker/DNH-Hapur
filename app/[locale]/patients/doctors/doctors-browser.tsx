'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Input } from '@/components/ui/input';

type DoctorRow = {
  slug: string;
  name: string;
  specialty: string;
  qualifications: string;
  languages: string;
  opdDays: string;
  departments: string[];
  image: string | null;
};

type DepartmentOption = { slug: string; name: string };

export function DoctorsBrowser({
  doctors,
  departments,
  placeholder,
  allLabel,
  opdLabel,
  languagesLabel,
  emptyLabel,
}: {
  doctors: DoctorRow[];
  departments: DepartmentOption[];
  placeholder: string;
  allLabel: string;
  opdLabel: string;
  languagesLabel: string;
  emptyLabel: string;
}) {
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState<string>('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctors.filter((d) => {
      if (department && !d.departments.includes(department)) return false;
      if (!q) return true;
      const haystack = `${d.name} ${d.specialty} ${d.qualifications}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [doctors, query, department]);

  return (
    <div>
      <div className="grid gap-6 border-rule rule-bottom pb-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Input
            type="search"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={placeholder}
          />
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <Chip active={!department} onClick={() => setDepartment('')}>
            {allLabel}
          </Chip>
          {departments.map((d) => (
            <Chip
              key={d.slug}
              active={department === d.slug}
              onClick={() => setDepartment(d.slug)}
            >
              {d.name}
            </Chip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink-mute mt-12 text-base">{emptyLabel}</p>
      ) : (
        <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((d) => (
            <li key={d.slug} className="flex flex-col">
              {d.image ? (
                <div className="bg-surface-deep relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={d.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover grayscale transition-[filter] hover:grayscale-0"
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] w-full bg-surface-deep" aria-hidden />
              )}
              <h3 className="font-display text-ink mt-4 text-lg leading-snug">
                <Link
                  href={`/patients/doctors/${d.slug}`}
                  className="hover:text-brand transition-colors"
                >
                  {d.name}
                </Link>
              </h3>
              <p className="text-ink-mute mt-1 text-sm">{d.specialty}</p>
              <p className="text-ink-soft mt-1 font-mono text-[10px] uppercase tracking-wider">
                {d.qualifications}
              </p>
              <dl className="text-ink-mute mt-3 space-y-1 text-xs">
                <div>
                  <dt className="text-ink-soft inline opacity-70">{opdLabel}: </dt>
                  <dd className="inline">{d.opdDays}</dd>
                </div>
                <div>
                  <dt className="text-ink-soft inline opacity-70">{languagesLabel}: </dt>
                  <dd className="inline">{d.languages}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'bg-brand text-surface px-3 py-1.5 text-xs font-medium tracking-wide'
          : 'bg-surface text-ink hover:text-brand border-rule border px-3 py-1.5 text-xs font-medium tracking-wide transition-colors'
      }
    >
      {children}
    </button>
  );
}
