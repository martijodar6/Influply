'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { creatorProfiles, companyProfiles } from '@/db/schema';
import { requireRole } from '@/lib/session';

// All actions here are only reachable from /admin/verifications, which is
// itself guarded by requireRole('ADMIN') — but each action re-checks the
// role too, since server actions can in principle be called directly.

export async function approveCreatorVerification(id: string) {
  await requireRole('ADMIN');
  await db
    .update(creatorProfiles)
    .set({ verificationStatus: 'VERIFIED', verifiedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(eq(creatorProfiles.id, id));
  revalidatePath('/admin/verifications');
}

export async function rejectCreatorVerification(id: string) {
  await requireRole('ADMIN');
  await db
    .update(creatorProfiles)
    .set({ verificationStatus: 'REJECTED', updatedAt: new Date().toISOString() })
    .where(eq(creatorProfiles.id, id));
  revalidatePath('/admin/verifications');
}

export async function approveCompanyVerification(id: string) {
  await requireRole('ADMIN');
  await db
    .update(companyProfiles)
    .set({ verificationStatus: 'VERIFIED', verifiedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(eq(companyProfiles.id, id));
  revalidatePath('/admin/verifications');
}

export async function rejectCompanyVerification(id: string) {
  await requireRole('ADMIN');
  await db
    .update(companyProfiles)
    .set({ verificationStatus: 'REJECTED', updatedAt: new Date().toISOString() })
    .where(eq(companyProfiles.id, id));
  revalidatePath('/admin/verifications');
}
