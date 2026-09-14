import { Suspense } from 'react';
import { Logo } from '@/components/logo';
import { SignUpForm } from './signup-form';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9ff] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo size={26} />
          <h1 className="text-2xl font-bold text-ink-900">Crea tu cuenta</h1>
          <p className="text-sm text-ink-500">Empieza en menos de un minuto.</p>
        </div>
        <Suspense>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
