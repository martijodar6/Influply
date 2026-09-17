'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { campaigns, companyProfiles, creatorProfiles, campaignInvitations, applications, notifications } from '@/db/schema';
import { requireRole } from '@/lib/session';

export type InviteState = { error?: string; success?: boolean } | null;

/** A company invites a specific creator to one of its own campaigns. */
export async function inviteCreatorToCampaign(campaignId: string, creatorId: string, message: string): Promise<InviteState> {
  const user = await requireRole('COMPANY');
  const company = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.userId, user.id) });
  if (!company) return { error: 'Completa tu perfil de empresa antes de invitar creadores.' };

  const campaign = await db.query.campaigns.findFirst({ where: eq(campaigns.id, campaignId) });
  if (!campaign || campaign.companyId !== company.id) return { error: 'Esta campaña no te pertenece.' };

  const creator = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.id, creatorId) });
  if (!creator) return { error: 'No se encontró al creador.' };

  const existing = await db.query.campaignInvitations.findFirst({
    where: and(eq(campaignInvitations.campaignId, campaignId), eq(campaignInvitations.creatorId, creatorId))
  });
  if (existing) return { error: 'Ya has invitado a este creador a esta campaña.' };

  await db.insert(campaignInvitations).values({
    id: randomUUID(),
    campaignId,
    creatorId,
    companyId: company.id,
    message: message.trim() || null
  });

  await db.insert(notifications).values({
    id: randomUUID(),
    userId: creator.userId,
    type: 'CAMPAIGN_INVITATION',
    message: `${company.name} te ha invitado a colaborar en "${campaign.title}".`,
    relatedUrl: '/creator/dashboard/invitations'
  });

  revalidatePath('/company/dashboard/creators');
  revalidatePath(`/company/dashboard/campaigns/${campaignId}/invite`);
  revalidatePath('/creator/dashboard/invitations');
  return { success: true };
}

/** The invited creator accepts or declines. Accepting also opens the campaign's applicant flow. */
export async function respondToInvitation(invitationId: string, decision: 'ACCEPTED' | 'REJECTED') {
  const user = await requireRole('CREATOR');
  const creator = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, user.id) });
  if (!creator) redirect('/onboarding/creator');

  const invitation = await db.query.campaignInvitations.findFirst({ where: eq(campaignInvitations.id, invitationId) });
  if (!invitation || invitation.creatorId !== creator.id) return;

  await db.update(campaignInvitations).set({ status: decision }).where(eq(campaignInvitations.id, invitationId));

  const campaign = await db.query.campaigns.findFirst({ where: eq(campaigns.id, invitation.campaignId) });
  if (!campaign) return;

  if (decision === 'ACCEPTED') {
    const existingApplication = await db.query.applications.findFirst({
      where: and(eq(applications.campaignId, campaign.id), eq(applications.creatorId, creator.id))
    });
    if (!existingApplication) {
      await db
        .insert(applications)
        .values({ id: randomUUID(), campaignId: campaign.id, creatorId: creator.id, message: invitation.message, status: 'ACCEPTED' });
    }
  }

  const company = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.id, invitation.companyId) });
  if (company) {
    await db.insert(notifications).values({
      id: randomUUID(),
      userId: company.userId,
      type: 'INVITATION_UPDATE',
      message: `${creator.displayName} ha ${decision === 'ACCEPTED' ? 'aceptado' : 'rechazado'} tu invitación a "${campaign.title}".`,
      relatedUrl: `/company/dashboard/campaigns/${campaign.id}/applicants`
    });
  }

  revalidatePath('/creator/dashboard/invitations');
  revalidatePath('/creator/dashboard/applications');
  revalidatePath(`/company/dashboard/campaigns/${campaign.id}/applicants`);
}
