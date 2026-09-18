import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { Logo } from '@/components/logo';
import { Card } from '@/components/ui/primitives';
import { VerifyEmailForm } from './verify-form';

// Reads the session on every request (fresh emailVerified flag), so it
// can't be statically prerendered at build time.
export const dynamic = 'force-dynamic';

export default async function VerifyEmailPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.emailVerified) redirect('/post-login');

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9ff] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo size={26} />
          <h1 className="text-2xl font-bold text-ink-900">Confirma tu email</h1>
          <p className="text-sm text-ink-500">
            Te hemos enviado un código de 6 dígitos a <b>{user.email}</b>. Introdúcelo para terminar de crear tu cuenta.
          </p>
        </div>
        <Card>
          <VerifyEmailForm />
        </Card>
      </div>
    </div>
  );
}
