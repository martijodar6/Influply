'use client';

import { useState } from 'react';
import { requestPasswordReset } from '@/actions/auth';
import { Button, Field, Input } from '@/components/ui/primitives';

export function ForgotForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await requestPasswordReset({ email });
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-xl2 border border-brand-100 bg-brand-50 p-5 text-sm text-brand-800">
        Si existe una cuenta con ese email, te hemos enviado un enlace para restablecer la contraseña. Revisa tu
        bandeja de entrada (y, en desarrollo local, la consola del servidor).
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Email">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" />
      </Field>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Enviando…' : 'Enviar enlace de recuperación'}
      </Button>
    </form>
  );
}
