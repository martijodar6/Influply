import { DashboardShell, companyNavItems } from '@/components/dashboard-shell';
import { Card } from '@/components/ui/primitives';
import { requireCompanyProfile } from '@/lib/guards';
import { ChangePasswordForm } from '@/components/change-password-form';

export default async function CompanySettingsPage() {
  const { user } = await requireCompanyProfile();

  return (
    <DashboardShell items={companyNavItems} activePath="/company/dashboard/settings" userName={user.name ?? ''} role={user.role}>
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Configuración</h1>
      <p className="mb-6 text-sm text-ink-500">Gestiona los datos de acceso a tu cuenta.</p>
      <Card className="max-w-lg">
        <h2 className="mb-4 font-semibold text-ink-900">Cambiar contraseña</h2>
        <ChangePasswordForm />
      </Card>
    </DashboardShell>
  );
}
