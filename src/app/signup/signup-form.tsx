'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { registerUser } from '@/actions/auth';
import { Button, Field, Input } from '@/components/ui/primitives';
import { clsx } from 'clsx';
import Link from 'next/link';

type Role = 'CREATOR' | 'COMPANY';

export function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = (params.get('role') as Role) || null;

  const [role, setRole] = useState<Role | null>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setError(null);
    setLoading(true);

    const result = await registerUser({ name, email, password, role });
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const signInResult = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (signInResult?.error) {
      setError('Cuenta creada, pero no se pudo iniciar sesión automáticamente. Prueba a iniciar sesión.');
      router.push('/login');
      return;
    }

    router.push(role === 'CREATOR' ? '/onboarding/creator' : '/onboarding/company');
    router.refresh();
  }

  if (!role) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <RoleCard
          title="Soy creador"
          description="Descubre campañas, crea tu portfolio y aplica a colaboraciones."
          onClick={() => setRole('CREATOR')}
        />
        <RoleCard
          title="Soy empresa"
          description="Publica campañas y encuentra a los creadores ideales para tu marca."
          onClick={() => setRole('COMPANY')}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <button type="button" onClick={() => setRole(null)} className="w-fit text-sm font-medium text-brand-600 hover:text-brand-700">
        ‹ {role === 'CREATOR' ? 'Soy creador' : 'Soy empresa'} — cambiar
      </button>

      <Field label={role === 'CREATOR' ? 'Nombre completo' : 'Nombre de la empresa'}>
        <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder={role === 'CREATOR' ? 'Ana Pérez' : 'Bar El Rincón'} />
      </Field>
      <Field label="Email">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" />
      </Field>
      <Field label="Contraseña" hint="Mínimo 8 caracteres">
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={loading} className="mt-2 w-full">
        {loading ? 'Creando cuenta…' : 'Crear cuenta'}
      </Button>

      <p className="text-center text-sm text-ink-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold text-brand-600">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}

function RoleCard({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex flex-col items-start gap-2 rounded-xl2 border border-ink-100 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft'
      )}
    >
      <span className="text-base font-bold text-ink-900">{title}</span>
      <span className="text-sm text-ink-500">{description}</span>
    </button>
  );
}
