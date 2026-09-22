import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

/** Use at the top of a page/action that requires any signed-in user. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

/** Use at the top of a page/action restricted to one role. */
export async function requireRole(role: 'CREATOR' | 'COMPANY' | 'ADMIN') {
  const user = await requireUser();
  if (user.role !== role) redirect('/');
  // Signup sends a 6-digit code to the email on file; nothing role-gated
  // (onboarding, dashboards, campaign actions...) is reachable until it's
  // confirmed. ADMIN is never gated — those accounts aren't self-signed-up.
  if (!user.emailVerified) redirect('/verify-email');
  return user;
}

/**
 * Use at the top of a page/action open to any signed-in role (browsing
 * creators/companies, applying to campaigns, messaging...) that still
 * requires a confirmed email — the same check requireRole() does, but
 * without pinning the caller to one role.
 */
export async function requireVerifiedUser() {
  const user = await requireUser();
  if (!user.emailVerified) redirect('/verify-email');
  return user;
}
