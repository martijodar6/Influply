'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { creatorProfiles, companyProfiles, campaigns, notifications } from '@/db/schema';
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

// Ad-review workflow: a campaign only appears in the public marketplace once
// an admin approves it here (independent of the company's own ACTIVE/CLOSED
// toggle). Reachable only from /admin/campaigns, guarded by requireRole('ADMIN')
// — each action re-checks the role too, since server actions can in principle
// be called directly.

async function notifyCampaignOwner(campaignId: string, companyId: string, title: string, message: string) {
  const company = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.id, companyId) });
  if (!company) return;
  await db.insert(notifications).values({
    id: randomUUID(),
    userId: company.userId,
    type: 'CAMPAIGN_REVIEW',
    message: message.replace('{title}', title),
    relatedUrl: `/campaigns/${campaignId}`
  });
}

export async function approveCampaign(id: string) {
  await requireRole('ADMIN');
  const campaign = await db.query.campaigns.findFirst({ where: eq(campaigns.id, id) });
  if (!campaign) return;
  await db.update(campaigns).set({ reviewStatus: 'APPROVED', updatedAt: new Date().toISOString() }).where(eq(campaigns.id, id));
  await notifyCampaignOwner(id, campaign.companyId, campaign.title, 'Tu campaña "{title}" ha sido aprobada y ya es visible en el marketplace.');
  revalidatePath('/admin/campaigns');
  revalidatePath('/campaigns');
  revalidatePath('/company/dashboard/campaigns');
}

export async function rejectCampaign(id: string) {
  await requireRole('ADMIN');
  const campaign = await db.query.campaigns.findFirst({ where: eq(campaigns.id, id) });
  if (!campaign) return;
  await db.update(campaigns).set({ reviewStatus: 'REJECTED', updatedAt: new Date().toISOString() }).where(eq(campaigns.id, id));
  await notifyCampaignOwner(id, campaign.companyId, campaign.title, 'Tu campaña "{title}" no ha sido aprobada. Revísala y contáctanos si tienes dudas.');
  revalidatePath('/admin/campaigns');
  revalidatePath('/campaigns');
  revalidatePath('/company/dashboard/campaigns');
}
