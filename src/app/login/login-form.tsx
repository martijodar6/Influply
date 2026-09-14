'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button, Field, Input } from '@/components/ui/primitives';
import Link from 'next/link';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError('Email o contraseña incorrectos.');
      return;
    }

    router.push('/post-login');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Email">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" />
      </Field>
      <Field label="Contraseña">
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </Field>

      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Entrando…' : 'Iniciar sesión'}
      </Button>

      <p className="text-center text-sm text-ink-500">
        ¿Aún no tienes cuenta?{' '}
        <Link href="/signup" className="font-semibold text-brand-600">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}
