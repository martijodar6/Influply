'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { applyToCampaign } from '@/actions/campaigns';
import { Button, Textarea } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { useEffect } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Enviando…' : 'Aplicar a campaña'}
    </Button>
  );
}

export function ApplyForm({ campaignId }: { campaignId: string }) {
  const [state, formAction] = useFormState(applyToCampaign, null);
  const { show } = useToast();

  useEffect(() => {
    if (state?.success) show('Tu candidatura ha sido enviada.');
  }, [state, show]);

  if (state?.success) {
    return (
      <div className="rounded-xl2 border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
        Candidatura enviada. Puedes ver su estado en <b>Mis aplicaciones</b>.
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="campaignId" value={campaignId} />
      <Textarea name="message" placeholder='"Creo que mi contenido encaja especialmente bien con vuestra marca porque…"' />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
