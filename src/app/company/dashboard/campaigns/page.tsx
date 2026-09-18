import Link from 'next/link';
import { DashboardShell, companyNavItems } from '@/components/dashboard-shell';
import { Badge, Card, EmptyState, LinkButton } from '@/components/ui/primitives';
import { requireCompanyProfile } from '@/lib/guards';
import { listCampaignsForCompany } from '@/lib/queries';
import { CampaignStatusToggle } from '@/components/campaign-status-toggle';
import { CAMPAIGN_REVIEW_STATUS_LABEL, type CampaignReviewStatus } from '@/lib/constants';

function reviewStatusLabel(status: string) {
  return CAMPAIGN_REVIEW_STATUS_LABEL[status as CampaignReviewStatus] ?? 'En revisión';
}

export default async function CompanyCampaignsPage() {
  const { user, profile } = await requireCompanyProfile();
  const campaigns = await listCampaignsForCompany(profile.id);
  const active = campaigns.filter((c) => c.status === 'ACTIVE');
  const finished = campaigns.filter((c) => c.status !== 'ACTIVE');

  return (
    <DashboardShell items={companyNavItems} activePath="/company/dashboard/campaigns" userName={user.name ?? ''} role={user.role}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Mis campañas</h1>
          <p className="text-sm text-ink-500">Gestiona tus colaboraciones publicadas.</p>
        </div>
        <LinkButton href="/company/dashboard/campaigns/new">+ Nueva campaña</LinkButton>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">Activas ({active.length})</h2>
        {active.length === 0 ? (
          <EmptyState
            title="Aún no tienes campañas activas"
            description="Publica tu primera campaña y empieza a recibir candidaturas de creadores."
            action={<LinkButton href="/company/dashboard/campaigns/new">Publicar campaña</LinkButton>}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {active.map((c) => (
              <CampaignRow key={c.id} campaign={c} />
            ))}
          </div>
        )}
      </section>

      {finished.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">Finalizadas ({finished.length})</h2>
          <div className="flex flex-col gap-3">
            {finished.map((c) => (
              <CampaignRow key={c.id} campaign={c} />
            ))}
          </div>
        </section>
      )}
    </DashboardShell>
  );
}

function CampaignRow({
  campaign
}: {
  campaign: { id: string; title: string; category: string; location: string; status: string; reviewStatus: string; applicantCount: number };
}) {
  const reviewTone = campaign.reviewStatus === 'APPROVED' ? 'success' : campaign.reviewStatus === 'REJECTED' ? 'danger' : 'warning';
  return (
    <Card className="flex items-center justify-between gap-4 p-4">
      <div>
        <Link href={`/campaigns/${campaign.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
          {campaign.title}
        </Link>
        <div className="mt-0.5 text-xs text-ink-500">
          {campaign.category} · {campaign.location}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge tone={reviewTone}>{reviewStatusLabel(campaign.reviewStatus)}</Badge>
        <Badge tone={campaign.status === 'ACTIVE' ? 'success' : 'neutral'}>{campaign.status === 'ACTIVE' ? 'Abierta' : 'Cerrada'}</Badge>
        <Link href={`/company/dashboard/campaigns/${campaign.id}/applicants`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
          {campaign.applicantCount} candidatos
        </Link>
        <Link href={`/company/dashboard/campaigns/${campaign.id}/invite`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Invitar creadores
        </Link>
        <CampaignStatusToggle campaignId={campaign.id} status={campaign.status} />
      </div>
    </Card>
  );
}
