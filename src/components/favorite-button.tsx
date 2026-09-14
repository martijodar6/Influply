'use client';

import { useState, useTransition } from 'react';
import { toggleFavorite } from '@/actions/campaigns';
import { clsx } from 'clsx';

export function FavoriteButton({ targetType, targetId, initial }: { targetType: 'CREATOR' | 'CAMPAIGN'; targetId: string; initial: boolean }) {
  const [active, setActive] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={active ? 'Quitar de guardados' : 'Guardar'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setActive((a) => !a);
        startTransition(() => {
          toggleFavorite(targetType, targetId);
        });
      }}
      disabled={pending}
      className={clsx(
        'flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur transition hover:scale-105',
        active ? 'text-brand-600' : 'text-ink-300'
      )}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M6 4h12v16l-6-4-6 4V4z" />
      </svg>
    </button>
  );
}
