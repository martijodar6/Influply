'use client';

import { useTransition } from 'react';
import { decideApplication } from '@/actions/campaigns';
import { Button } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';

export function ApplicationDecisionButtons({ applicationId, status }: { applicationId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const { show } = useToast();

  function decide(decision: 'ACCEPTED' | 'REJECTED' | 'COMPLETED') {
    startTransition(async () => {
      await decideApplication(applicationId, decision);
      show(decision === 'ACCEPTED' ? 'Candidatura aceptada.' : decision === 'REJECTED' ? 'Candidatura rechazada.' : 'Colaboración marcada como completada.');
    });
  }

  if (status === 'PENDING') {
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

  if (status === 'ACCEPTED') {
    return (
      <Button variant="secondary" disabled={pending} onClick={() => decide('COMPLETED')}>
        Marcar como completada
      </Button>
    );
  }

  return null;
}
