import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DashboardShell, companyNavItems } from '@/components/dashboard-shell';
import { Badge, Card, EmptyState } from '@/components/ui/primitives';
import { requireCompanyProfile } from '@/lib/guards';
import { getCampaignDetail, listCreatorCards, getInvitedCreatorIdsForCampaign } from '@/lib/queries';
import { InviteButton } from '@/components/invite-button';

export default async function InviteCreatorsToCampaignPage({ params }: { params: { id: string } }) {
  const { user, profile } = await requireCompanyProfile();
  const campaign = await getCampaignDetail(params.id);
  if (!campaign || campaign.companyId !== profile.id) notFound();

  const [creators, invitedIds] = await Promise.all([listCreatorCards(), getInvitedCreatorIdsForCampaign(campaign.id)]);

  return (
    <DashboardShell items={companyNavItems} activePath="/company/dashboard/campaigns" userName={user.name ?? ''} role={user.role}>
      <div className="mb-6">
        <Link href={`/company/dashboard/campaigns/${campaign.id}/applicants`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
          ‹ Candidatos de {campaign.title}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-ink-900">Invitar creadores — {campaign.title}</h1>
        <p className="text-sm text-ink-500">Invita directamente a los creadores que encajen con esta campaña, sin esperar a que apliquen.</p>
      </div>

      {creators.length === 0 ? (
        <EmptyState title="Aún no hay creadores en la plataforma" description="Vuelve más tarde." />
      ) : (
        <div className="flex flex-col gap-3">
          {creators.map((c) => {
            const totalFollowers = c.socials.reduce((sum, s) => sum + (s.followers ?? 0), 0);
            const invited = invitedIds.has(c.id);
            return (
              <Card key={c.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 flex-none overflow-hidden rounded-full bg-ink-100">
                    {c.avatarUrl && <Image src={c.avatarUrl} alt={c.displayName} fill className="object-cover" unoptimized />}
                  </div>
                  <div>
                    <Link href={`/creators/${c.username}`} className="font-semibold text-ink-900 hover:text-brand-700">
                      {c.displayName}
                    </Link>
                    <div className="text-xs text-ink-500">
                      {c.city ?? 'Ubicación no indicada'} · {totalFollowers.toLocaleString('es-ES')} seguidores · {c.categories.join(', ') || 'Sin categoría'}
                    </div>
                  </div>
                </div>
                {invited ? <Badge tone="brand">Ya invitado</Badge> : <InviteButton campaignId={campaign.id} creatorId={c.id} />}
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
