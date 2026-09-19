'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitCompanyVerification } from '@/actions/profile';
import { Button, Field, Input, Textarea } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending} className="self-start">
      {pending ? 'Enviando…' : 'Solicitar verificación'}
    </Button>
  );
}

// No ID documents: the business proves it's real with its CIF/NIF plus a
// public proof (Google Maps listing, official website) an admin can match
// against the name/address already on the profile.
export function CompanyVerificationForm({ taxId, rejected }: { taxId: string | null; rejected: boolean }) {
  const [state, formAction] = useFormState(submitCompanyVerification, null);
  const { show } = useToast();

  useEffect(() => {
    if (state?.success) show('Solicitud enviada. La revisaremos en breve.');
    if (state?.error) show(state.error, 'error');
  }, [state, show]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="text-sm text-ink-500">
        {rejected
          ? 'Tu solicitud anterior fue rechazada. Puedes volver a enviarla.'
          : 'Indícanos el CIF/NIF del negocio y un enlace público que lo confirme (con el mismo nombre y dirección que pusiste en el perfil).'}
      </p>
      <Field label="CIF / NIF" required>
        <Input name="taxId" defaultValue={taxId ?? ''} placeholder="B12345678" />
      </Field>
      <Field label="Enlace de prueba" required hint="Ficha de Google Maps, web oficial, redes sociales del negocio…">
        <Input name="verificationProofUrl" placeholder="https://maps.app.goo.gl/…" />
      </Field>
      <Textarea name="verificationNote" placeholder="Algo más que nos ayude a verificar el negocio (opcional)" />
      <SubmitButton />
    </form>
  );
}
