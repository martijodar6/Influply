import Link from 'next/link';
import { DashboardShell, companyNavItems } from '@/components/dashboard-shell';
import { Badge, Card, LinkButton } from '@/components/ui/primitives';
import { requireCompanyProfile } from '@/lib/guards';
import { listCampaignsForCompany } from '@/lib/queries';

export default async function CompanyDashboardPage({ searchParams }: { searchParams: { welcome?: string } }) {
  const { user, profile } = await requireCompanyProfile();
  const campaigns = await listCampaignsForCompany(profile.id);

  const active = campaigns.filter((c) => c.status === 'ACTIVE');
  const finished = campaigns.filter((c) => c.status !== 'ACTIVE');
  const totalApplications = campaigns.reduce((sum, c) => sum + c.applicantCount, 0);

  return (
    <DashboardShell items={companyNavItems} activePath="/company/dashboard" userName={user.name ?? ''} role={user.role}>
      {searchParams.welcome && (
        <div className="mb-6 rounded-xl2 border border-brand-100 bg-brand-50 p-4 text-sm text-brand-800">
          ¡Perfil de empresa creado correctamente! Ya puedes publicar tu primera campaña.
        </div>
      )}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Hola, {profile.name}</h1>
          <p className="text-sm text-ink-500">Esto es lo que está pasando con tus campañas.</p>
        </div>
        <LinkButton href="/company/dashboard/campaigns/new">+ Nueva campaña</LinkButton>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Campañas activas" value={active.length} />
        <StatCard label="Campañas finalizadas" value={finished.length} />
        <StatCard label="Candidaturas recibidas" value={totalApplications} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink-900">Campañas activas</h2>
        <Link href="/company/dashboard/campaigns" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Ver todas →
        </Link>
      </div>
      {active.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-500">Aún no tienes campañas activas.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {active.slice(0, 5).map((c) => (
            <Card key={c.id} className="flex items-center justify-between">
              <div>
                <Link href={`/campaigns/${c.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                  {c.title}
                </Link>
                <div className="mt-0.5 text-xs text-ink-500">
                  {c.category} · {c.location}
                </div>
              </div>
              <Link href={`/company/dashboard/campaigns/${c.id}/applicants`}>
                <Badge tone="brand">{c.applicantCount} candidatos</Badge>
              </Link>
            </Card>
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
