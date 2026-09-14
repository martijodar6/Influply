import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/session';
import { Logo } from '@/components/logo';
import { Card } from '@/components/ui/primitives';
import { CreatorOnboardingForm } from './form';

export default async function CreatorOnboardingPage() {
  const user = await requireRole('CREATOR');
  if (user.onboardingDone) redirect('/creator/dashboard');

  return (
    <div className="min-h-screen bg-[#faf9ff] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo size={24} />
          <h1 className="text-2xl font-bold text-ink-900">Crea tu perfil de creador</h1>
          <p className="text-sm text-ink-500">Así es como te verán las empresas. Puedes editarlo después.</p>
        </div>
        <Card>
          <CreatorOnboardingForm />
        </Card>
      </div>
    </div>
  );
}
