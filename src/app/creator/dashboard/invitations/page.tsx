import Link from 'next/link';
import { DashboardShell, creatorNavItems } from '@/components/dashboard-shell';
import { Badge, Card, EmptyState } from '@/components/ui/primitives';
import { requireCreatorProfile } from '@/lib/guards';
import { listInvitationsForCreator } from '@/lib/queries';
import { INVITATION_STATUS_LABEL } from '@/lib/constants';
import { InvitationDecisionButtons } from '@/components/invitation-decision-buttons';

const badgeTone: Record<string, 'warning' | 'success' | 'danger' | 'neutral'> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger'
};

export default async function CreatorInvitationsPage() {
  const { user, profile } = await requireCreatorProfile();
  const invitations = await listInvitationsForCreator(profile.id);

  return (
    <DashboardShell items={creatorNavItems} activePath="/creator/dashboard/invitations" userName={user.name ?? ''} role={user.role}>
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Invitaciones</h1>
      <p className="mb-6 text-sm text-ink-500">Campañas a las que te han invitado directamente las empresas.</p>

      {invitations.length === 0 ? (
        <EmptyState
          title="Todavía no tienes invitaciones"
          description="Cuando una empresa te invite a colaborar en una campaña, aparecerá aquí."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {invitations.map((inv) => (
            <Card key={inv.id} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Link href={`/campaigns/${inv.campaignId}`} className="font-semibold text-ink-900 hover:text-brand-700">
                    {inv.title}
                  </Link>
                  <Badge tone={badgeTone[inv.status]}>{INVITATION_STATUS_LABEL[inv.status as keyof typeof INVITATION_STATUS_LABEL]}</Badge>
                </div>
                <div className="mt-0.5 text-xs text-ink-500">
                  {inv.companyName} · {inv.category} · {inv.location}
                </div>
                {inv.message && <p className="mt-2 max-w-xl text-sm italic text-ink-700">“{inv.message}”</p>}
              </div>
              <InvitationDecisionButtons invitationId={inv.id} status={inv.status} />
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
