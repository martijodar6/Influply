import Image from 'next/image';
import Link from 'next/link';
import { DashboardShell, companyNavItems } from '@/components/dashboard-shell';
import { Badge, EmptyState } from '@/components/ui/primitives';
import { requireCompanyProfile } from '@/lib/guards';
import { listConversationsForCompany } from '@/lib/queries';

export default async function CompanyMessagesPage() {
  const { user, profile } = await requireCompanyProfile();
  const conversations = await listConversationsForCompany(profile.id);

  return (
    <DashboardShell items={companyNavItems} activePath="/company/dashboard/messages" userName={user.name ?? ''} role={user.role}>
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Mensajes</h1>
      <p className="mb-6 text-sm text-ink-500">Conversaciones con creadores.</p>

      {conversations.length === 0 ? (
        <EmptyState
          title="Aún no tienes conversaciones"
          description="Escribe a un creador desde su perfil para empezar a chatear."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/company/dashboard/messages/${c.id}`}
              className="flex items-center justify-between gap-4 rounded-xl2 border border-ink-100 bg-white p-4 transition hover:bg-ink-100/40"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 flex-none overflow-hidden rounded-full bg-ink-100">
                  {c.otherAvatarUrl && <Image src={c.otherAvatarUrl} alt={c.otherName} fill className="object-cover" unoptimized />}
                </div>
                <div>
                  <div className="font-semibold text-ink-900">{c.otherName}</div>
                  <div className="max-w-sm truncate text-xs text-ink-500">{c.lastMessage ?? 'Sin mensajes todavía'}</div>
                </div>
              </div>
              {c.unreadCount > 0 && <Badge tone="brand">{c.unreadCount}</Badge>}
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
