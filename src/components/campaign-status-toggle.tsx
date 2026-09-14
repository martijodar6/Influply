'use client';

import { useTransition } from 'react';
import { setCampaignStatus } from '@/actions/campaigns';
import { Button } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';

export function CampaignStatusToggle({ campaignId, status }: { campaignId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const { show } = useToast();

  function toggle() {
    const next = status === 'CLOSED' ? 'ACTIVE' : 'CLOSED';
    startTransition(async () => {
      await setCampaignStatus(campaignId, next);
      show(next === 'CLOSED' ? 'Campaña cerrada.' : 'Campaña reabierta.');
    });
  }

  return (
    <Button type="button" variant="secondary" disabled={pending} onClick={toggle}>
      {status === 'CLOSED' ? 'Reabrir' : 'Cerrar campaña'}
    </Button>
  );
}
