import { DashboardShell, creatorNavItems } from '@/components/dashboard-shell';
import { Card, LinkButton } from '@/components/ui/primitives';
import { CampaignCard } from '@/components/campaign-card';
import { requireCreatorProfile } from '@/lib/guards';
import { listActiveCampaignCards, listApplicationsForCreator, isFavorite } from '@/lib/queries';

export default async function CreatorDashboardPage({ searchParams }: { searchParams: { welcome?: string } }) {
  const { user, profile } = await requireCreatorProfile();
  const [allCampaigns, applications] = await Promise.all([listActiveCampaignCards(), listApplicationsForCreator(profile.id)]);

  const recommended = allCampaigns
    .filter((c) => c.category && profile.categories && JSON.parse(profile.categories || '[]').includes(c.category))
    .slice(0, 3);
  const fallback = recommended.length > 0 ? recommended : allCampaigns.slice(0, 3);

  const pending = applications.filter((a) => a.status === 'PENDING').length;
  const accepted = applications.filter((a) => a.status === 'ACCEPTED').length;

  const favChecks = await Promise.all(fallback.map((c) => isFavorite(user.id, 'CAMPAIGN', c.id)));

  return (
    <DashboardShell items={creatorNavItems} activePath="/creator/dashboard" userName={user.name ?? ''} role={user.role}>
      {searchParams.welcome && (
        <div className="mb-6 rounded-xl2 border border-brand-100 bg-brand-50 p-4 text-sm text-brand-800">
          ¡Perfil creado correctamente! Ya apareces en el explorador de creadores.
        </div>
      )}
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Hola, {profile.displayName.split(' ')[0]}</h1>
      <p className="mb-6 text-sm text-ink-500">Esto es lo que está pasando con tus colaboraciones.</p>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Candidaturas pendientes" value={pending} />
        <StatCard label="Candidaturas aceptadas" value={accepted} />
        <StatCard label="Candidaturas totales" value={applications.length} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink-900">Campañas recomendadas para ti</h2>
        <LinkButton href="/campaigns" variant="ghost">
          Ver todas →
        </LinkButton>
      </div>
      {fallback.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-500">Todavía no hay campañas activas. Vuelve pronto.</p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {fallback.map((c, i) => (
            <CampaignCard key={c.id} campaign={c} isFavorite={favChecks[i]} canFavorite />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <div className="text-xs text-ink-500">{label}</div>
      <div className="mt-1 text-3xl font-bold text-ink-900">{value}</div>
    </Card>
  );
}
