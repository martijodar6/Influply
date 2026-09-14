import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { creatorProfiles, companyProfiles } from '@/db/schema';
import { requireRole } from '@/lib/session';

export async function requireCreatorProfile() {
  const user = await requireRole('CREATOR');
  const profile = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, user.id) });
  if (!profile) redirect('/onboarding/creator');
  return { user, profile };
}

export async function requireCompanyProfile() {
  const user = await requireRole('COMPANY');
  const profile = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.userId, user.id) });
  if (!profile) redirect('/onboarding/company');
  return { user, profile };
}
