import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

// This page reads the session on every request, so it must never be
// statically prerendered at build time (there is no request/cookies
// context then, which crashes NextAuth's URL resolution).
export const dynamic = 'force-dynamic';

// A tiny router-only page: after a client-side signIn(), land here so a
// Server Component can read the fresh session and send everyone to the
// right place — onboarding if it isn't finished yet, their dashboard
// otherwise. Keeps that branching logic in one spot.
export default async function PostLoginPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  if (user.role === 'CREATOR') {
    redirect(user.onboardingDone ? '/creator/dashboard' : '/onboarding/creator');
  }
  if (user.role === 'COMPANY') {
    redirect(user.onboardingDone ? '/company/dashboard' : '/onboarding/company');
  }
  if (user.role === 'ADMIN') {
    redirect('/admin/verifications');
  }
  redirect('/');
}
