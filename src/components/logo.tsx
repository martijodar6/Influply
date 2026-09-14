import Link from 'next/link';
import { clsx } from 'clsx';

// Inline recreation of the Influply mark (two overlapping figures, indigo →
// violet) so it renders crisp at any size with no image request.
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="12" cy="9" r="5" fill="#5a45e8" />
      <circle cx="25" cy="9" r="4.5" fill="#b9a6ff" />
      <path
        d="M4 34c0-8 6-13 15-13 3.2 0 6 .8 8.2 2.2L18.4 32c-.9.9-2.4.9-3.3 0l-3-3"
        stroke="#5a45e8"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M36 34c0-6.5-3.8-11-9.6-12.6" stroke="#b9a6ff" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <Link href="/" className={clsx('inline-flex items-center gap-2', className)}>
      <LogoMark size={size + 6} />
      <span className="text-lg font-bold tracking-tight text-ink-900">Influply</span>
    </Link>
  );
}
