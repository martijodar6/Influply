import { PublicNavbar } from '@/components/public-navbar';
import { CampaignCard } from '@/components/campaign-card';
import { CampaignFilters } from '@/components/campaign-filters';
import { EmptyState } from '@/components/ui/primitives';
import { listActiveCampaignCards, isFavorite } from '@/lib/queries';
import { getCurrentUser } from '@/lib/session';

export default async function CampaignsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const [campaigns, user] = await Promise.all([listActiveCampaignCards().catch(() => []), getCurrentUser()]);
  const q = typeof searchParams.q === 'string' ? searchParams.q.toLowerCase() : '';
  const location = typeof searchParams.location === 'string' ? searchParams.location : '';
  const categories = ([] as string[]).concat((searchParams.category as string[] | string | undefined) ?? []);
  const compensations = ([] as string[]).concat((searchParams.compensation as string[] | string | undefined) ?? []);
  const platform = typeof searchParams.platform === 'string' ? searchParams.platform : '';

  const filtered = campaigns.filter((c) => {
    if (q && !`${c.title} ${c.company.name}`.toLowerCase().includes(q)) return false;
    if (location && c.location !== location) return false;
    if (categories.length && !categories.includes(c.category)) return false;
    if (compensations.length && !c.compensationTypes.some((t) => compensations.includes(t))) return false;
    if (platform && platform !== 'Indistinto' && c.mainPlatform && c.mainPlatform !== platform) return false;
    return true;
  });

  let favoriteIds = new Set<string>();
  if (user) {
    const checks = await Promise.all(filtered.map((c) => isFavorite(user.id, 'CAMPAIGN', c.id)));
    favoriteIds = new Set(filtered.filter((_, i) => checks[i]).map((c) => c.id));
  }

  return (
    <div className="min-h-screen bg-[#faf9ff]">
      <PublicNavbar />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-900">Campañas</h1>
          <p className="mt-1 text-ink-500">{filtered.length} colaboraciones abiertas ahora mismo.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <CampaignFilters />
          </aside>
          <div>
            {filtered.length === 0 ? (
              <EmptyState title="No hay campañas con estos filtros" description="Prueba a quitar algún filtro o vuelve más tarde: se publican campañas nuevas cada semana." />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((c) => (
                  <CampaignCard key={c.id} campaign={c} isFavorite={favoriteIds.has(c.id)} canFavorite={user?.role === 'CREATOR'} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
