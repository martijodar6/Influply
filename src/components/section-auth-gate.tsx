import { LinkButton } from '@/components/ui/primitives';

// Small hand-drawn lock mark, matching the stroke style used across the
// app's other inline icons (see social-icons.tsx / logo.tsx).
function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" />
    </svg>
  );
}

// Shown instead of a section's real content (campaign or creator listings)
// when nobody is signed in. The section itself stays reachable — only the
// data behind it is gated — so a visitor lands here and picks a way in.
export function SectionAuthGate({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 rounded-xl2 border border-ink-100 bg-white px-8 py-14 text-center shadow-soft">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <LockIcon />
        </span>
        <div>
          <h1 className="text-xl font-bold text-ink-900">{title}</h1>
          <p className="mt-2 text-sm text-ink-500">{description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/login">Iniciar sesión</LinkButton>
          <LinkButton href="/signup" variant="secondary">
            Crear cuenta
          </LinkButton>
        </div>
        <p className="text-xs text-ink-400">Puedes entrar como empresa o como creador.</p>
      </div>
    </div>
  );
}
