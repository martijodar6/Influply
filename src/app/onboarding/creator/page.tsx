import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/session';
import { Logo } from '@/components/logo';
import { Card } from '@/components/ui/primitives';
import { generateVerificationCode } from '@/lib/verification';
import { CreatorOnboardingForm } from './form';

export default async function CreatorOnboardingPage() {
  const user = await requireRole('CREATOR');
  if (user.onboardingDone) redirect('/creator/dashboard');

  // Generated fresh on every page load, purely to show in the optional
  // last step — nothing is persisted until the whole form is submitted
  // (it round-trips back as a hidden field alongside the profile insert
  // in completeCreatorOnboarding, same code the user was shown here).
  const verificationCode = generateVerificationCode();

  return (
    <div className="min-h-screen bg-[#faf9ff] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo size={24} />
          <h1 className="text-2xl font-bold text-ink-900">Crea tu perfil de creador</h1>
          <p className="text-sm text-ink-500">Así es como te verán las empresas. Puedes editarlo después.</p>
        </div>
        <Card>
          <CreatorOnboardingForm verificationCode={verificationCode} />
        </Card>
      </div>
    </div>
  );
}
