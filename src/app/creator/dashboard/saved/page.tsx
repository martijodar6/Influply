import { DashboardShell, creatorNavItems } from '@/components/dashboard-shell';
import { CampaignCard } from '@/components/campaign-card';
import { EmptyState, LinkButton } from '@/components/ui/primitives';
import { requireCreatorProfile } from '@/lib/guards';
import { listFavoriteCampaigns } from '@/lib/queries';

export default async function CreatorSavedPage() {
  const { user } = await requireCreatorProfile();
  const campaigns = await listFavoriteCampaigns(user.id);

  return (
    <DashboardShell items={creatorNavItems} activePath="/creator/dashboard/saved" userName={user.name ?? ''} role={user.role}>
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Guardados</h1>
      <p className="mb-6 text-sm text-ink-500">Campañas que has marcado para revisar más tarde.</p>
      {campaigns.length === 0 ? (
        <EmptyState
          title="Aún no has guardado ninguna campaña"
          description="Explora el marketplace y pulsa el icono de guardar en las campañas que te interesen."
          action={<LinkButton href="/campaigns">Explorar campañas</LinkButton>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} isFavorite canFavorite />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
