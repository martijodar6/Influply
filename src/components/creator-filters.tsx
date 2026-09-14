'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Chip, Input, Select, Field } from '@/components/ui/primitives';
import { CREATOR_CATEGORIES } from '@/lib/constants';
import { useState, useTransition } from 'react';

const LOCATIONS = ['Barcelona', 'Madrid', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga'];
const FOLLOWER_TIERS = [
  { label: 'Cualquiera', value: '' },
  { label: '1.000+', value: '1000' },
  { label: '5.000+', value: '5000' },
  { label: '10.000+', value: '10000' },
  { label: '50.000+', value: '50000' }
];

export function CreatorFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [, startTransition] = useTransition();

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  function toggleMulti(key: string, value: string) {
    const current = params.getAll(key);
    const next = new URLSearchParams(params.toString());
    next.delete(key);
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    updated.forEach((v) => next.append(key, v));
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  const activeCategories = params.getAll('category');
  const activePlatforms = params.getAll('platform');

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update('q', q || null);
        }}
      >
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar creadores por nombre…" className="w-full" />
      </form>
      <div className="flex flex-wrap gap-2">
        {LOCATIONS.map((loc) => (
          <Chip key={loc} active={params.get('location') === loc} onClick={() => update('location', params.get('location') === loc ? null : loc)}>
            {loc}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {CREATOR_CATEGORIES.map((c) => (
          <Chip key={c} active={activeCategories.includes(c)} onClick={() => toggleMulti('category', c)}>
            {c}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip active={activePlatforms.includes('INSTAGRAM')} onClick={() => toggleMulti('platform', 'INSTAGRAM')}>
          Instagram
        </Chip>
        <Chip active={activePlatforms.includes('TIKTOK')} onClick={() => toggleMulti('platform', 'TIKTOK')}>
          TikTok
        </Chip>
        <Chip active={activePlatforms.includes('YOUTUBE')} onClick={() => toggleMulti('platform', 'YOUTUBE')}>
          YouTube
        </Chip>
      </div>
      <Field label="Seguidores mínimos">
        <Select value={params.get('minFollowers') ?? ''} onChange={(e) => update('minFollowers', e.target.value || null)}>
          {FOLLOWER_TIERS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}
