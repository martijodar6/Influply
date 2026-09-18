import Image from 'next/image';
import Link from 'next/link';
import { DashboardShell, adminNavItems } from '@/components/dashboard-shell';
import { Card, Badge, Button } from '@/components/ui/primitives';
import { requireRole } from '@/lib/session';
import { listPendingCampaignReviews } from '@/lib/queries';
import { approveCampaign, rejectCampaign } from '@/actions/admin';

export default async function AdminCampaignsPage() {
  const user = await requireRole('ADMIN');
  const pending = await listPendingCampaignReviews();

  return (
    <DashboardShell items={adminNavItems} activePath="/admin/campaigns" userName={user.name ?? ''} role={user.role}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Campañas pendientes de revisión</h1>
        <p className="text-sm text-ink-500">Ninguna campaña aparece en el marketplace público hasta que la apruebes aquí.</p>
      </div>

      <Card>
        <h2 className="mb-4 font-semibold text-ink-900">
          {pending.length} pendiente{pending.length === 1 ? '' : 's'}
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-ink-400">No hay campañas esperando revisión.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-4 rounded-xl2 border border-ink-100 p-3">
                <div className="flex gap-3">
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                    {c.coverImageUrl && <Image src={c.coverImageUrl} alt="" fill className="object-cover" unoptimized />}
                  </div>
                  <div>
                    <Link href={`/campaigns/${c.id}`} target="_blank" className="font-medium text-ink-900 hover:text-brand-700">
                      {c.title}
                    </Link>
                    <div className="text-xs text-ink-500">
                      {c.companyName} · {c.category} · {c.location}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-ink-400">
                      {c.budgetApprox && <span>Presupuesto: {c.budgetApprox}</span>}
                      <Badge tone={c.companyVerificationStatus === 'VERIFIED' ? 'success' : 'neutral'}>
                        Empresa: {c.companyVerificationStatus === 'VERIFIED' ? 'verificada' : 'sin verificar'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={approveCampaign.bind(null, c.id)}>
                    <Button type="submit" variant="primary">
                      Aprobar
                    </Button>
                  </form>
                  <form action={rejectCampaign.bind(null, c.id)}>
                    <Button type="submit" variant="danger">
                      Rechazar
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
