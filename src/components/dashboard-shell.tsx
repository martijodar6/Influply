import Link from 'next/link';
import { Logo } from '@/components/logo';
import { UserMenu } from '@/components/user-menu';
import { clsx } from 'clsx';

type NavItem = { href: string; label: string; icon: React.ReactNode };

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
    </svg>
  );
}
function IconCampaign() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 13h4" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" />
      <circle cx="18" cy="9" r="2.8" />
      <path d="M15.5 14.3c2.9.5 5 2.6 5 5.7" />
    </svg>
  );
}
function IconBookmark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h12v16l-6-4-6 4V4z" />
    </svg>
  );
}
function IconInbox() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 12l2.5 2.5L16 9" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" />
    </svg>
  );
}

function IconMessage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

export const creatorNavItems: NavItem[] = [
  { href: '/creator/dashboard', label: 'Inicio', icon: <IconHome /> },
  { href: '/campaigns', label: 'Campañas', icon: <IconCampaign /> },
  { href: '/creator/dashboard/applications', label: 'Mis aplicaciones', icon: <IconInbox /> },
  { href: '/creator/dashboard/invitations', label: 'Invitaciones', icon: <IconMail /> },
  { href: '/creator/dashboard/messages', label: 'Mensajes', icon: <IconMessage /> },
  { href: '/creator/dashboard/saved', label: 'Guardados', icon: <IconBookmark /> },
  { href: '/creator/dashboard/profile', label: 'Perfil', icon: <IconUser /> },
  { href: '/creator/dashboard/settings', label: 'Configuración', icon: <IconSettings /> }
];

export const adminNavItems: NavItem[] = [
  { href: '/admin/verifications', label: 'Verificaciones', icon: <IconInbox /> },
  { href: '/admin/campaigns', label: 'Campañas', icon: <IconCampaign /> }
];

export const companyNavItems: NavItem[] = [
  { href: '/company/dashboard', label: 'Inicio', icon: <IconHome /> },
  { href: '/company/dashboard/creators', label: 'Explorar creadores', icon: <IconUsers /> },
  { href: '/company/dashboard/campaigns', label: 'Mis campañas', icon: <IconCampaign /> },
  { href: '/company/dashboard/applicants', label: 'Candidatos', icon: <IconInbox /> },
  { href: '/company/dashboard/messages', label: 'Mensajes', icon: <IconMessage /> },
  { href: '/company/dashboard/saved', label: 'Guardados', icon: <IconBookmark /> },
  { href: '/company/dashboard/profile', label: 'Perfil', icon: <IconUser /> },
  { href: '/company/dashboard/settings', label: 'Configuración', icon: <IconSettings /> }
];

export function DashboardShell({
  items,
  activePath,
  userName,
  role,
  children
}: {
  items: NavItem[];
  activePath: string;
  userName: string;
  role: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#faf9ff]">
      <aside className="flex w-64 flex-none flex-col gap-6 border-r border-ink-100 bg-white px-4 py-6">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const active = activePath === item.href || (item.href !== items[0].href && activePath.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  active ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-100/60 hover:text-ink-900'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-2 text-xs text-ink-300">Influply · MVP</div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-end border-b border-ink-100 bg-white/70 px-8 py-3 backdrop-blur">
          <UserMenu name={userName} role={role} />
        </header>
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
