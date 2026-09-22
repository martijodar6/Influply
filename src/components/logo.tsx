import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';

// Source asset (public/logo-mark.png) is 480x375 — not a square mark, so
// `size` is treated as the height and the width follows this ratio to
// avoid stretching it.
const MARK_ASPECT_RATIO = 480 / 375;

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/logo-mark.png"
      alt=""
      aria-hidden="true"
      width={Math.round(size * MARK_ASPECT_RATIO)}
      height={size}
      priority
      className="select-none"
    />
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
