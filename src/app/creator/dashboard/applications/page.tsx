import Link from 'next/link';
import { DashboardShell, creatorNavItems } from '@/components/dashboard-shell';
import { Badge, Card, EmptyState, LinkButton } from '@/components/ui/primitives';
import { requireCreatorProfile } from '@/lib/guards';
import { listApplicationsForCreator } from '@/lib/queries';
import { APPLICATION_STATUS_LABEL } from '@/lib/constants';

const badgeTone: Record<string, 'warning' | 'success' | 'danger' | 'neutral'> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  COMPLETED: 'neutral'
};

export default async function CreatorApplicationsPage() {
  const { user, profile } = await requireCreatorProfile();
  const applications = await listApplicationsForCreator(profile.id);

  const groups: { key: string; label: string }[] = [
    { key: 'PENDING', label: 'Pendientes' },
    { key: 'ACCEPTED', label: 'Aceptadas' },
    { key: 'REJECTED', label: 'Rechazadas' },
    { key: 'COMPLETED', label: 'Completadas' }
  ];

  return (
    <DashboardShell items={creatorNavItems} activePath="/creator/dashboard/applications" userName={user.name ?? ''} role={user.role}>
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Mis aplicaciones</h1>
      <p className="mb-6 text-sm text-ink-500">Sigue el estado de tus candidaturas.</p>

      {applications.length === 0 ? (
        <EmptyState
          title="Todavía no has aplicado a ninguna campaña"
          description="Explora el marketplace y aplica a las colaboraciones que encajen contigo."
          action={<LinkButton href="/campaigns">Explorar campañas</LinkButton>}
        />
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((g) => {
            const items = applications.filter((a) => a.status === g.key);
            if (items.length === 0) return null;
            return (
              <section key={g.key}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">
                  {g.label} ({items.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {items.map((a) => (
                    <Card key={a.id} className="flex items-center justify-between gap-4">
                      <div>
                        <Link href={`/campaigns/${a.campaignId}`} className="font-semibold text-ink-900 hover:text-brand-700">
                          {a.title}
                        </Link>
                        <div className="mt-0.5 text-xs text-ink-500">
                          {a.companyName} · {a.category} · {a.location}
                        </div>
                      </div>
                      <Badge tone={badgeTone[a.status]}>{APPLICATION_STATUS_LABEL[a.status as keyof typeof APPLICATION_STATUS_LABEL]}</Badge>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
