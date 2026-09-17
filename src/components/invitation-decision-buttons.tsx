'use client';

import { useTransition } from 'react';
import { respondToInvitation } from '@/actions/invitations';
import { Button } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';

export function InvitationDecisionButtons({ invitationId, status }: { invitationId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const { show } = useToast();

  function decide(decision: 'ACCEPTED' | 'REJECTED') {
    startTransition(async () => {
      await respondToInvitation(invitationId, decision);
      show(decision === 'ACCEPTED' ? 'Invitación aceptada.' : 'Invitación rechazada.');
    });
  }

  if (status !== 'PENDING') return null;

  return (
    <div className="flex gap-2">
      <Button variant="secondary" disabled={pending} onClick={() => decide('REJECTED')}>
        Rechazar
      </Button>
      <Button disabled={pending} onClick={() => decide('ACCEPTED')}>
        Aceptar
      </Button>
    </div>
  );
}
