import { DashboardShell, companyNavItems } from '@/components/dashboard-shell';
import { CreatorCard } from '@/components/creator-card';
import { EmptyState, LinkButton } from '@/components/ui/primitives';
import { requireCompanyProfile } from '@/lib/guards';
import { listFavoriteCreators } from '@/lib/queries';

export default async function CompanySavedPage() {
  const { user } = await requireCompanyProfile();
  const creators = await listFavoriteCreators(user.id);

  return (
    <DashboardShell items={companyNavItems} activePath="/company/dashboard/saved" userName={user.name ?? ''} role={user.role}>
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Creadores guardados</h1>
      <p className="mb-6 text-sm text-ink-500">Tu lista corta para futuras campañas.</p>
      {creators.length === 0 ? (
        <EmptyState
          title="Aún no has guardado ningún creador"
          description="Explora creadores y pulsa el icono de guardar en los perfiles que te interesen."
          action={<LinkButton href="/company/dashboard/creators">Explorar creadores</LinkButton>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {creators.map((c) => (
            <CreatorCard key={c.id} creator={c} isFavorite canFavorite />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
