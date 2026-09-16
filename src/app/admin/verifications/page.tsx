import { DashboardShell, adminNavItems } from '@/components/dashboard-shell';
import { Card, Badge, Button } from '@/components/ui/primitives';
import { requireRole } from '@/lib/session';
import { listCreatorVerificationRequests, listCompanyVerificationRequests } from '@/lib/queries';
import { approveCreatorVerification, rejectCreatorVerification, approveCompanyVerification, rejectCompanyVerification } from '@/actions/admin';

export default async function AdminVerificationsPage() {
  const user = await requireRole('ADMIN');
  const [creatorRequests, companyRequests] = await Promise.all([
    listCreatorVerificationRequests(),
    listCompanyVerificationRequests()
  ]);

  return (
    <DashboardShell items={adminNavItems} activePath="/admin/verifications" userName={user.name ?? ''} role={user.role}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Solicitudes de verificación</h1>
        <p className="text-sm text-ink-500">Revisa las pruebas enviadas y aprueba o rechaza cada solicitud.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold text-ink-900">Creadores · {creatorRequests.length} pendiente{creatorRequests.length === 1 ? '' : 's'}</h2>
          {creatorRequests.length === 0 ? (
            <p className="text-sm text-ink-400">No hay solicitudes pendientes.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {creatorRequests.map((c) => (
                <div key={c.id} className="rounded-xl2 border border-ink-100 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-ink-900">{c.displayName}</div>
                      <div className="text-xs text-ink-500">
                        @{c.username} · {c.email}
                      </div>
                    </div>
                    <Badge tone="warning">Pendiente</Badge>
                  </div>
                  {c.verificationNote && <p className="mt-2 whitespace-pre-line text-sm text-ink-700">{c.verificationNote}</p>}
                  <div className="mt-3 flex gap-2">
                    <form action={approveCreatorVerification.bind(null, c.id)}>
                      <Button type="submit" variant="primary">
                        Aprobar
                      </Button>
                    </form>
                    <form action={rejectCreatorVerification.bind(null, c.id)}>
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

        <Card>
          <h2 className="mb-4 font-semibold text-ink-900">Empresas · {companyRequests.length} pendiente{companyRequests.length === 1 ? '' : 's'}</h2>
          {companyRequests.length === 0 ? (
            <p className="text-sm text-ink-400">No hay solicitudes pendientes.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {companyRequests.map((c) => (
                <div key={c.id} className="rounded-xl2 border border-ink-100 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-ink-900">{c.name}</div>
                      <div className="text-xs text-ink-500">
                        {c.email}
                        {c.taxId ? ` · CIF/NIF: ${c.taxId}` : ''}
                      </div>
                    </div>
                    <Badge tone="warning">Pendiente</Badge>
                  </div>
                  {c.verificationNote && <p className="mt-2 whitespace-pre-line text-sm text-ink-700">{c.verificationNote}</p>}
                  <div className="mt-3 flex gap-2">
                    <form action={approveCompanyVerification.bind(null, c.id)}>
                      <Button type="submit" variant="primary">
                        Aprobar
                      </Button>
                    </form>
                    <form action={rejectCompanyVerification.bind(null, c.id)}>
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
      </div>
    </DashboardShell>
  );
}
