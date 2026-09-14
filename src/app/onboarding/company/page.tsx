import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/session';
import { Logo } from '@/components/logo';
import { Card } from '@/components/ui/primitives';
import { CompanyOnboardingForm } from './form';

export default async function CompanyOnboardingPage() {
  const user = await requireRole('COMPANY');
  if (user.onboardingDone) redirect('/company/dashboard');

  return (
    <div className="min-h-screen bg-[#faf9ff] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo size={24} />
          <h1 className="text-2xl font-bold text-ink-900">Crea el perfil de tu empresa</h1>
          <p className="text-sm text-ink-500">Así es como te verán los creadores. Puedes editarlo después.</p>
        </div>
        <Card>
          <CompanyOnboardingForm />
        </Card>
      </div>
    </div>
  );
}
