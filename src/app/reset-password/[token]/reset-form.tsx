'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetPassword } from '@/actions/auth';
import { Button, Field, Input } from '@/components/ui/primitives';

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await resetPassword({ token, password });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
    setTimeout(() => router.push('/login'), 1800);
  }

  if (done) {
    return (
      <div className="rounded-xl2 border border-emerald-100 bg-emerald-50 p-5 text-sm text-emerald-800">
        Contraseña actualizada correctamente. Te llevamos a iniciar sesión…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Nueva contraseña" hint="Mínimo 8 caracteres">
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      </Field>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Guardando…' : 'Guardar nueva contraseña'}
      </Button>
    </form>
  );
}
