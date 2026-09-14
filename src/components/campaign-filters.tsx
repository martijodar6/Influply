'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Chip, Input } from '@/components/ui/primitives';
import { CREATOR_CATEGORIES, COMPENSATION_TYPES, COMPENSATION_TYPE_LABEL, MAIN_PLATFORMS } from '@/lib/constants';
import { useState, useTransition } from 'react';

const LOCATIONS = ['Barcelona', 'Madrid', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga'];

export function CampaignFilters() {
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
  const activeCompensation = params.getAll('compensation');

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update('q', q || null);
        }}
      >
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar campañas por nombre o marca…" className="w-full" />
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
        {COMPENSATION_TYPES.map((c) => (
          <Chip key={c} active={activeCompensation.includes(c)} onClick={() => toggleMulti('compensation', c)}>
            {COMPENSATION_TYPE_LABEL[c]}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {MAIN_PLATFORMS.map((p) => (
          <Chip key={p} active={params.get('platform') === p} onClick={() => update('platform', params.get('platform') === p ? null : p)}>
            {p}
          </Chip>
        ))}
      </div>
    </div>
  );
}
