'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { changePassword } from '@/actions/profile';
import { Button, Field, Input } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Guardando…' : 'Actualizar contraseña'}
    </Button>
  );
}

export function ChangePasswordForm() {
  const [state, formAction] = useFormState(changePassword, null);
  const { show } = useToast();

  useEffect(() => {
    if (state?.success) show('Contraseña actualizada.');
  }, [state, show]);

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <Field label="Contraseña actual">
        <Input type="password" name="currentPassword" required />
      </Field>
      <Field label="Nueva contraseña" hint="Mínimo 8 caracteres">
        <Input type="password" name="newPassword" required minLength={8} />
      </Field>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
