import { DashboardShell, companyNavItems } from '@/components/dashboard-shell';
import { CreatorCard } from '@/components/creator-card';
import { CreatorFilters } from '@/components/creator-filters';
import { InviteToCampaignForm } from '@/components/invite-to-campaign-form';
import { EmptyState } from '@/components/ui/primitives';
import { requireCompanyProfile } from '@/lib/guards';
import { listCreatorCards, isFavorite, listCampaignsForCompany } from '@/lib/queries';

export default async function CompanyExploreCreatorsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const { user, profile } = await requireCompanyProfile();
  const creators = await listCreatorCards();
  const myCampaigns = await listCampaignsForCompany(profile.id);
  const activeCampaigns = myCampaigns.filter((c) => c.status === 'ACTIVE').map((c) => ({ id: c.id, title: c.title }));

  const q = typeof searchParams.q === 'string' ? searchParams.q.toLowerCase() : '';
  const location = typeof searchParams.location === 'string' ? searchParams.location : '';
  const categories = ([] as string[]).concat((searchParams.category as string[] | string | undefined) ?? []);
  const platforms = ([] as string[]).concat((searchParams.platform as string[] | string | undefined) ?? []);
  const minFollowers = Number(searchParams.minFollowers) || 0;

  const filtered = creators.filter((c) => {
    if (q && !c.displayName.toLowerCase().includes(q)) return false;
    if (location && c.city !== location) return false;
    if (categories.length && !categories.some((cat) => c.categories.includes(cat))) return false;
    if (platforms.length && !platforms.some((p) => c.socials.some((s) => s.platform === p))) return false;
    if (minFollowers) {
      const total = c.socials.reduce((sum, s) => sum + (s.followers ?? 0), 0);
      if (total < minFollowers) return false;
    }
    return true;
  });

  const checks = await Promise.all(filtered.map((c) => isFavorite(user.id, 'CREATOR', c.id)));
  const favoriteIds = new Set(filtered.filter((_, i) => checks[i]).map((c) => c.id));

  return (
    <DashboardShell items={companyNavItems} activePath="/company/dashboard/creators" userName={user.name ?? ''} role={user.role}>
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Explorar creadores</h1>
      <p className="mb-6 text-sm text-ink-500">Descubre creadores directamente, sin esperar a que apliquen.</p>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <CreatorFilters />
        </aside>
        <div>
          {filtered.length === 0 ? (
            <EmptyState title="No hay creadores con estos filtros" description="Prueba a ajustar la búsqueda." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((c) => (
                <div key={c.id} className="flex flex-col gap-2">
                  <CreatorCard creator={c} isFavorite={favoriteIds.has(c.id)} canFavorite />
                  <InviteToCampaignForm creatorId={c.id} campaigns={activeCampaigns} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
