'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitCreatorVerification } from '@/actions/profile';
import { Button, Textarea } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { VERIFICATION_CONTACT_HANDLE } from '@/lib/verification';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending} className="self-start">
      {pending ? 'Enviando…' : 'He completado la verificación'}
    </Button>
  );
}

// No ID documents: the creator proves they control the social handle(s) on
// their profile by sending a one-time code from that account, plus a selfie
// holding it — an admin cross-checks both before approving.
export function CreatorVerificationForm({ code, rejected }: { code: string; rejected: boolean }) {
  const [state, formAction] = useFormState(submitCreatorVerification, null);
  const { show } = useToast();

  useEffect(() => {
    if (state?.success) show('Solicitud enviada. La revisaremos en breve.');
    if (state?.error) show(state.error, 'error');
  }, [state, show]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="text-sm text-ink-500">
        {rejected ? 'Tu solicitud anterior fue rechazada. Puedes volver a intentarlo con este código:' : 'Para comprobar que tu cuenta es real:'}
      </p>
      <ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink-600">
        <li>
          Envía este código por mensaje directo (o coméntalo en nuestra última publicación) desde tu cuenta de Instagram o TikTok a{' '}
          <b>{VERIFICATION_CONTACT_HANDLE}</b>:{' '}
          <span className="rounded bg-brand-50 px-2 py-0.5 font-mono font-bold tracking-wider text-brand-700">{code}</span>
        </li>
        <li>Hazte una selfie sujetando ese código (escrito a mano o en la pantalla del móvil) y súbela abajo.</li>
      </ol>
      <input type="file" name="verificationSelfie" accept="image/png,image/jpeg,image/webp" required className="text-sm" />
      <Textarea name="verificationNote" placeholder="Algo más que nos ayude a verificarte (opcional)" />
      <SubmitButton />
    </form>
  );
}
