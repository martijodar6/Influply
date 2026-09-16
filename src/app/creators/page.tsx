import { PublicNavbar } from '@/components/public-navbar';
import { CreatorCard } from '@/components/creator-card';
import { CreatorFilters } from '@/components/creator-filters';
import { EmptyState } from '@/components/ui/primitives';
import { SectionAuthGate } from '@/components/section-auth-gate';
import { listCreatorCards, isFavorite } from '@/lib/queries';
import { getCurrentUser } from '@/lib/session';

export default async function CreatorsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#faf9ff]">
        <PublicNavbar />
        <SectionAuthGate
          title="Inicia sesión para explorar creadores"
          description="Regístrate o inicia sesión como empresa o como creador para ver el listado completo."
        />
      </div>
    );
  }

  const creators = await listCreatorCards().catch(() => []);
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

  let favoriteIds = new Set<string>();
  if (user) {
    const checks = await Promise.all(filtered.map((c) => isFavorite(user.id, 'CREATOR', c.id)));
    favoriteIds = new Set(filtered.filter((_, i) => checks[i]).map((c) => c.id));
  }

  return (
    <div className="min-h-screen bg-[#faf9ff]">
      <PublicNavbar />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-900">Explorar creadores</h1>
          <p className="mt-1 text-ink-500">{filtered.length} creadores listos para colaborar.</p>
        </div>
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
                  <CreatorCard key={c.id} creator={c} isFavorite={favoriteIds.has(c.id)} canFavorite={user?.role === 'COMPANY'} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

