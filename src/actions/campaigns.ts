'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { campaigns, companyProfiles, applications, creatorProfiles, favorites, notifications } from '@/db/schema';
import { requireRole, requireVerifiedUser } from '@/lib/session';
import { saveUpload, UploadError } from '@/lib/storage';
import { toJsonArray, toJsonObject } from '@/lib/json';
import type { FormState } from '@/actions/onboarding';

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

export async function createCampaign(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole('COMPANY');
  const company = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.userId, user.id) });
  if (!company) redirect('/onboarding/company');

  const title = str(formData, 'title');
  const description = str(formData, 'description');
  const category = str(formData, 'category');
  const location = str(formData, 'location');
  if (!title || !description || !category || !location) {
    return { error: 'Completa los campos obligatorios: nombre, descripción, categoría y ubicación.' };
  }

  const objective = str(formData, 'objective') || null;
  const startDate = str(formData, 'startDate') || null;
  const applicationDeadline = str(formData, 'applicationDeadline') || null;
  const budgetApprox = str(formData, 'budgetApprox') || null;
  const creatorTypes = formData.getAll('creatorTypes').map(String);
  const compensationTypes = formData.getAll('compensationTypes').map(String);

  // A campaign has to say what it offers before it can go live — otherwise a
  // creator can't tell what they'd be applying for.
  if (compensationTypes.length === 0) {
    return { error: 'Selecciona al menos un tipo de compensación (qué ofrece tu empresa).' };
  }
  if (compensationTypes.includes('PAID') && !budgetApprox) {
    return { error: 'Indica el presupuesto aproximado: has marcado "Colaboración pagada".' };
  }

  const contentRequested = [0, 1, 2, 3, 4]
    .map((i) => ({ type: str(formData, `content_type_${i}`), qty: Number(str(formData, `content_qty_${i}`)) || 0 }))
    .filter((c) => c.type && c.qty > 0);
  if (contentRequested.length === 0) {
    return { error: 'Indica al menos un tipo de contenido esperado y su cantidad.' };
  }

  const requirements = {
    minFollowers: str(formData, 'minFollowers') ? Number(str(formData, 'minFollowers')) : undefined,
    ageRange: str(formData, 'ageRange') || undefined,
    contentCategory: str(formData, 'contentCategory') || undefined,
    mainPlatform: str(formData, 'mainPlatform') || undefined,
    audienceType: str(formData, 'audienceType') || undefined
  };

  let coverImageUrl: string | null = null;
  const cover = formData.get('coverImage');
  if (cover instanceof File && cover.size > 0) {
    try {
      coverImageUrl = await saveUpload(cover, 'campaign-cover');
    } catch (e) {
      return { error: e instanceof UploadError ? e.message : 'No se pudo subir la imagen de la campaña.' };
    }
  }

  const id = randomUUID();
  await db.insert(campaigns).values({
    id,
    companyId: company.id,
    title,
    description,
    objective,
    category,
    location,
    startDate,
    applicationDeadline,
    creatorTypes: toJsonArray(creatorTypes),
    requirements: toJsonObject(requirements),
    compensationTypes: toJsonArray(compensationTypes),
    budgetApprox,
    contentRequested: toJsonArray(contentRequested),
    coverImageUrl,
    status: 'ACTIVE',
    reviewStatus: 'PENDING'
  });

  revalidatePath('/campaigns');
  revalidatePath('/company/dashboard/campaigns');
  redirect(`/company/dashboard/campaigns?created=1`);
}

export async function setCampaignStatus(campaignId: string, status: 'ACTIVE' | 'CLOSED' | 'DRAFT') {
  const user = await requireRole('COMPANY');
  const company = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.userId, user.id) });
  if (!company) return;
  const campaign = await db.query.campaigns.findFirst({ where: eq(campaigns.id, campaignId) });
  if (!campaign || campaign.companyId !== company.id) return;

  await db.update(campaigns).set({ status }).where(eq(campaigns.id, campaignId));
  revalidatePath('/campaigns');
  revalidatePath('/company/dashboard/campaigns');
}

export type ApplyState = { error?: string; success?: boolean } | null;

export async function applyToCampaign(_prev: ApplyState, formData: FormData): Promise<ApplyState> {
  const user = await requireVerifiedUser();
  if (user.role !== 'CREATOR') return { error: 'Solo los creadores pueden aplicar a campañas.' };

  const campaignId = str(formData, 'campaignId');
  const message = str(formData, 'message');

  const creator = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, user.id) });
  if (!creator) redirect('/onboarding/creator');

  const campaign = await db.query.campaigns.findFirst({ where: eq(campaigns.id, campaignId) });
  if (!campaign || campaign.status !== 'ACTIVE' || campaign.reviewStatus !== 'APPROVED') {
    return { error: 'Esta campaña ya no admite candidaturas.' };
  }

  const existing = await db.query.applications.findFirst({
    where: and(eq(applications.campaignId, campaignId), eq(applications.creatorId, creator.id))
  });
  if (existing) return { error: 'Ya has aplicado a esta campaña.' };

  await db.insert(applications).values({ id: randomUUID(), campaignId, creatorId: creator.id, message: message || null });

  const company = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.id, campaign.companyId) });
  if (company) {
    await db.insert(notifications).values({
      id: randomUUID(),
      userId: company.userId,
      type: 'NEW_APPLICATION',
      message: `${creator.displayName} ha aplicado a "${campaign.title}".`,
      relatedUrl: `/company/dashboard/campaigns/${campaign.id}/applicants`
    });
  }

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath('/creator/dashboard/applications');
  return { success: true };
}

export async function decideApplication(applicationId: string, decision: 'ACCEPTED' | 'REJECTED' | 'COMPLETED') {
  const user = await requireRole('COMPANY');
  const company = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.userId, user.id) });
  if (!company) return;

  const application = await db.query.applications.findFirst({ where: eq(applications.id, applicationId) });
  if (!application) return;
  const campaign = await db.query.campaigns.findFirst({ where: eq(campaigns.id, application.campaignId) });
  if (!campaign || campaign.companyId !== company.id) return;

  await db.update(applications).set({ status: decision }).where(eq(applications.id, applicationId));

  const creator = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.id, application.creatorId) });
  if (creator) {
    const labels: Record<string, string> = { ACCEPTED: 'aceptado', REJECTED: 'rechazado', COMPLETED: 'marcado como completado' };
    await db.insert(notifications).values({
      id: randomUUID(),
      userId: creator.userId,
      type: 'APPLICATION_UPDATE',
      message: `Tu candidatura a "${campaign.title}" ha sido ${labels[decision]}.`,
      relatedUrl: `/creator/dashboard/applications`
    });
  }

  revalidatePath(`/company/dashboard/campaigns/${campaign.id}/applicants`);
  revalidatePath('/creator/dashboard/applications');
}

export async function toggleFavorite(targetType: 'CREATOR' | 'CAMPAIGN', targetId: string) {
  const user = await requireVerifiedUser();

  const existing = await db.query.favorites.findFirst({
    where: and(eq(favorites.userId, user.id), eq(favorites.targetType, targetType), eq(favorites.targetId, targetId))
  });

  if (existing) {
    await db.delete(favorites).where(eq(favorites.id, existing.id));
  } else {
    await db.insert(favorites).values({ id: randomUUID(), userId: user.id, targetType, targetId });
  }

  revalidatePath('/company/dashboard/saved');
  revalidatePath('/creator/dashboard/saved');
  revalidatePath('/campaigns');
  revalidatePath('/creators');
}
