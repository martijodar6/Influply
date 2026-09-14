import { DashboardShell, companyNavItems } from '@/components/dashboard-shell';
import { Card } from '@/components/ui/primitives';
import { requireCompanyProfile } from '@/lib/guards';
import { NewCampaignForm } from './form';

export default async function NewCampaignPage() {
  const { user } = await requireCompanyProfile();

  return (
    <DashboardShell items={companyNavItems} activePath="/company/dashboard/campaigns" userName={user.name ?? ''} role={user.role}>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-2xl font-bold text-ink-900">Nueva campaña</h1>
        <p className="mb-6 text-sm text-ink-500">Publícala y aparecerá automáticamente en el marketplace.</p>
        <Card>
          <NewCampaignForm />
        </Card>
      </div>
    </DashboardShell>
  );
}
