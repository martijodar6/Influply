import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { Logo } from '@/components/logo';
import { LinkButton } from '@/components/ui/primitives';
import { UserMenu } from '@/components/user-menu';

export async function PublicNavbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-500 md:flex">
            <Link href="/campaigns" className="hover:text-ink-900">
              Campañas
            </Link>
            <Link href="/creators" className="hover:text-ink-900">
              Creadores
            </Link>
            <Link href="/#como-funciona" className="hover:text-ink-900">
              Cómo funciona
            </Link>
          </nav>
        </div>

        {user ? (
          <UserMenu name={user.name ?? user.email ?? ''} role={user.role} />
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-ink-700 hover:text-ink-900">
              Iniciar sesión
            </Link>
            <LinkButton href="/signup">Crear cuenta</LinkButton>
          </div>
        )}
      </div>
    </header>
  );
}
