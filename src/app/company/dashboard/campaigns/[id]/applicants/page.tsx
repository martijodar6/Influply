import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DashboardShell, companyNavItems } from '@/components/dashboard-shell';
import { Badge, Card, EmptyState } from '@/components/ui/primitives';
import { requireCompanyProfile } from '@/lib/guards';
import { getCampaignDetail, listApplicationsForCampaign } from '@/lib/queries';
import { APPLICATION_STATUS_LABEL } from '@/lib/constants';
import { ApplicationDecisionButtons } from '@/components/application-decision-buttons';
import { FavoriteButton } from '@/components/favorite-button';

const badgeTone: Record<string, 'warning' | 'success' | 'danger' | 'neutral'> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  COMPLETED: 'neutral'
};

export default async function ApplicantsPage({ params }: { params: { id: string } }) {
  const { user, profile } = await requireCompanyProfile();
  const campaign = await getCampaignDetail(params.id);
  if (!campaign || campaign.companyId !== profile.id) notFound();

  const applicants = await listApplicationsForCampaign(campaign.id);

  return (
    <DashboardShell items={companyNavItems} activePath="/company/dashboard/campaigns" userName={user.name ?? ''} role={user.role}>
      <div className="mb-6">
        <Link href="/company/dashboard/campaigns" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          ‹ Mis campañas
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-ink-900">Candidatos — {campaign.title}</h1>
        <p className="text-sm text-ink-500">{applicants.length} candidaturas recibidas.</p>
      </div>

      {applicants.length === 0 ? (
        <EmptyState title="Todavía no hay candidatos" description="En cuanto un creador aplique a esta campaña, aparecerá aquí." />
      ) : (
        <div className="flex flex-col gap-4">
          {applicants.map((a) => (
            <Card key={a.id} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div className="relative h-14 w-14 flex-none overflow-hidden rounded-full bg-ink-100">
                  {a.avatarUrl && <Image src={a.avatarUrl} alt={a.displayName} fill className="object-cover" unoptimized />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/creators/${a.username}`} className="font-semibold text-ink-900 hover:text-brand-700">
                      {a.displayName}
                    </Link>
                    <Badge tone={badgeTone[a.status]}>{APPLICATION_STATUS_LABEL[a.status as keyof typeof APPLICATION_STATUS_LABEL]}</Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-ink-500">
                    {a.city ?? 'Ubicación no indicada'} · {a.totalFollowers.toLocaleString('es-ES')} seguidores · {a.categories.join(', ') || 'Sin categoría'}
                  </div>
                  {a.message && <p className="mt-2 max-w-xl text-sm italic text-ink-700">“{a.message}”</p>}
                  <Link href={`/creators/${a.username}`} className="mt-2 inline-block text-sm font-medium text-brand-600 hover:text-brand-700">
                    Ver perfil completo →
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FavoriteButton targetType="CREATOR" targetId={a.creatorId} initial={false} />
                <ApplicationDecisionButtons applicationId={a.id} status={a.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
