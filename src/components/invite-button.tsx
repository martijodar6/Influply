'use client';

import { useTransition } from 'react';
import { inviteCreatorToCampaign } from '@/actions/invitations';
import { Button } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';

export function InviteButton({ campaignId, creatorId }: { campaignId: string; creatorId: string }) {
  const [pending, startTransition] = useTransition();
  const { show } = useToast();

  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const res = await inviteCreatorToCampaign(campaignId, creatorId, '');
          show(res?.error ?? 'Invitación enviada.', res?.error ? 'error' : 'success');
        });
      }}
    >
      Invitar
    </Button>
  );
}
