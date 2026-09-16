'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export function UserMenu({ name, role }: { name: string; role: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const dashboardHref = role === 'ADMIN' ? '/admin/verifications' : role === 'COMPANY' ? '/company/dashboard' : '/creator/dashboard';
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white"
      >
        {initials || '?'}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl2 border border-ink-100 bg-white py-1 shadow-soft">
          <div className="border-b border-ink-100 px-4 py-2 text-sm font-semibold text-ink-900">{name}</div>
          <Link href={dashboardHref} className="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-100/60">
            Mi dashboard
          </Link>
          {role !== 'ADMIN' && (
            <Link
              href={role === 'COMPANY' ? '/company/dashboard/profile' : '/creator/dashboard/profile'}
              className="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-100/60"
            >
              Mi perfil
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
