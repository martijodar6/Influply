'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { verifyEmailCode, resendVerificationCode } from '@/actions/auth';
import { Button, Field, Input } from '@/components/ui/primitives';

export function VerifyEmailForm() {
  const router = useRouter();
  const { update } = useSession();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await verifyEmailCode({ code });
    if (!result.ok) {
      setLoading(false);
      setError(result.error);
      return;
    }

    // Refresh the JWT so `emailVerified` flips to true before we navigate —
    // otherwise the next page's requireRole()/getCurrentUser() check would
    // still see the stale (unverified) session and bounce back here.
    await update();
    router.push('/post-login');
    router.refresh();
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    await resendVerificationCode();
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 8000);
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Código de verificación">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            className="text-center text-lg tracking-[0.5em]"
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading || code.length !== 6} className="w-full">
          {loading ? 'Comprobando…' : 'Confirmar email'}
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={handleResend} disabled={resending} className="font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50">
          {resending ? 'Enviando…' : 'Reenviar código'}
        </button>
        <button type="button" onClick={() => signOut({ callbackUrl: '/login' })} className="text-ink-400 hover:text-ink-600">
          Cerrar sesión
        </button>
      </div>

      {resent && <p className="text-sm text-emerald-600">Te hemos enviado un nuevo código.</p>}
    </div>
  );
}
