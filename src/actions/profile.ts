'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { creatorProfiles, companyProfiles, socialNetworks, portfolioItems, users } from '@/db/schema';
import { requireCreatorProfile, requireCompanyProfile } from '@/lib/guards';
import { getCurrentUser } from '@/lib/session';
import { saveUpload, UploadError } from '@/lib/storage';
import { toJsonArray, parseArray } from '@/lib/json';
import { verifyPassword, hashPassword } from '@/lib/password';
import { generateVerificationCode } from '@/lib/verification';
export type ProfileFormState = { error?: string; success?: boolean } | null;

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

// ---- Creator ----

export async function updateCreatorBasicInfo(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const { profile } = await requireCreatorProfile();

  const displayName = str(formData, 'displayName');
  if (!displayName) return { error: 'Escribe tu nombre.' };

  let avatarUrl = profile.avatarUrl;
  const avatar = formData.get('avatar');
  if (avatar instanceof File && avatar.size > 0) {
    try {
      avatarUrl = await saveUpload(avatar, 'avatar');
    } catch (e) {
      return { error: e instanceof UploadError ? e.message : 'No se pudo subir la foto.' };
    }
  }

  await db
    .update(creatorProfiles)
    .set({
      displayName,
      city: str(formData, 'city') || null,
      bio: str(formData, 'bio') || null,
      categories: toJsonArray(formData.getAll('categories').map(String)),
      languages: toJsonArray(formData.getAll('languages').map(String)),
      priceApprox: str(formData, 'priceApprox') || null,
      availability: str(formData, 'availability') || null,
      brandsWorkedWith: toJsonArray(
        str(formData, 'brandsWorkedWith')
          .split(',')
          .map((b) => b.trim())
          .filter(Boolean)
      ),
      avatarUrl,
      updatedAt: new Date().toISOString()
    })
    .where(eq(creatorProfiles.id, profile.id));

  revalidatePath('/creator/dashboard/profile');
  revalidatePath(`/creators/${profile.username}`);
  return { success: true };
}

export async function addSocialNetwork(formData: FormData) {
  const { profile } = await requireCreatorProfile();
  const platform = str(formData, 'platform');
  const handle = str(formData, 'handle');
  if (!platform || !handle) return;
  const followersRaw = str(formData, 'followers');

  await db.insert(socialNetworks).values({
    id: randomUUID(),
    creatorId: profile.id,
    platform,
    handle,
    followers: followersRaw ? Number(followersRaw) || null : null
  });
  revalidatePath('/creator/dashboard/profile');
  revalidatePath(`/creators/${profile.username}`);
}

export async function deleteSocialNetwork(id: string) {
  const { profile } = await requireCreatorProfile();
  const row = await db.query.socialNetworks.findFirst({ where: eq(socialNetworks.id, id) });
  if (!row || row.creatorId !== profile.id) return;
  await db.delete(socialNetworks).where(eq(socialNetworks.id, id));
  revalidatePath('/creator/dashboard/profile');
  revalidatePath(`/creators/${profile.username}`);
}

export async function addPortfolioPhoto(formData: FormData) {
  const { profile } = await requireCreatorProfile();
  const file = formData.get('photo');
  if (!(file instanceof File) || file.size === 0) return;
  try {
    const url = await saveUpload(file, 'portfolio-photo');
    await db.insert(portfolioItems).values({
      id: randomUUID(),
      creatorId: profile.id,
      type: 'PHOTO',
      url,
      caption: str(formData, 'caption') || null,
      brand: str(formData, 'brand') || null
    });
  } catch {
    // ignore a single bad upload
  }
  revalidatePath('/creator/dashboard/profile');
  revalidatePath(`/creators/${profile.username}`);
}

export async function addPortfolioVideo(formData: FormData) {
  const { profile } = await requireCreatorProfile();
  const url = str(formData, 'url');
  if (!url) return;
  await db.insert(portfolioItems).values({ id: randomUUID(), creatorId: profile.id, type: 'VIDEO', externalVideoUrl: url, caption: str(formData, 'caption') || null });
  revalidatePath('/creator/dashboard/profile');
  revalidatePath(`/creators/${profile.username}`);
}

export async function deletePortfolioItem(id: string) {
  const { profile } = await requireCreatorProfile();
  const row = await db.query.portfolioItems.findFirst({ where: eq(portfolioItems.id, id) });
  if (!row || row.creatorId !== profile.id) return;
  await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
  revalidatePath('/creator/dashboard/profile');
  revalidatePath(`/creators/${profile.username}`);
}

// The verification code has to exist and be visible *before* the creator
// submits (they need to send it via DM/comment first), so it's generated
// lazily the first time the profile page renders the "unverified" card —
// not inside submitCreatorVerification, which only records the attempt.
export async function ensureCreatorVerificationCode(): Promise<string> {
  const { profile } = await requireCreatorProfile();
  if (profile.verificationCode) return profile.verificationCode;

  const code = generateVerificationCode();
  await db.update(creatorProfiles).set({ verificationCode: code }).where(eq(creatorProfiles.id, profile.id));
  return code;
}

export async function submitCreatorVerification(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const { profile } = await requireCreatorProfile();
  const verificationNote = str(formData, 'verificationNote') || null;

  let verificationSelfieUrl = profile.verificationSelfieUrl;
  const selfie = formData.get('verificationSelfie');
  if (selfie instanceof File && selfie.size > 0) {
    try {
      verificationSelfieUrl = await saveUpload(selfie, 'verification-selfie');
    } catch (e) {
      return { error: e instanceof UploadError ? e.message : 'No se pudo subir la selfie.' };
    }
  }
  if (!verificationSelfieUrl) return { error: 'Sube una selfie sujetando tu código de verificación.' };

  await db
    .update(creatorProfiles)
    .set({ verificationStatus: 'PENDING', verificationNote, verificationSelfieUrl, updatedAt: new Date().toISOString() })
    .where(eq(creatorProfiles.id, profile.id));

  revalidatePath('/creator/dashboard/profile');
  return { success: true };
}

// ---- Company ----

export async function updateCompanyBasicInfo(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const { profile } = await requireCompanyProfile();

  const name = str(formData, 'name');
  if (!name) return { error: 'Escribe el nombre de la empresa.' };

  let logoUrl = profile.logoUrl;
  const logo = formData.get('logo');
  if (logo instanceof File && logo.size > 0) {
    try {
      logoUrl = await saveUpload(logo, 'logo');
    } catch (e) {
      return { error: e instanceof UploadError ? e.message : 'No se pudo subir el logo.' };
    }
  }

  await db
    .update(companyProfiles)
    .set({
      name,
      category: str(formData, 'category') || profile.category,
      city: str(formData, 'city') || null,
      description: str(formData, 'description') || null,
      website: str(formData, 'website') || null,
      instagram: str(formData, 'instagram') || null,
      tiktok: str(formData, 'tiktok') || null,
      logoUrl,
      updatedAt: new Date().toISOString()
    })
    .where(eq(companyProfiles.id, profile.id));

  revalidatePath('/company/dashboard/profile');
  revalidatePath(`/companies/${profile.slug}`);
  return { success: true };
}

export async function addCompanyPhoto(formData: FormData) {
  const { profile } = await requireCompanyProfile();
  const file = formData.get('photo');
  if (!(file instanceof File) || file.size === 0) return;
  try {
    const url = await saveUpload(file, 'business-photo');
    const photos = parseArray<string>(profile.photos);
    await db.update(companyProfiles).set({ photos: toJsonArray([...photos, url]) }).where(eq(companyProfiles.id, profile.id));
  } catch {
    // ignore
  }
  revalidatePath('/company/dashboard/profile');
  revalidatePath(`/companies/${profile.slug}`);
}

export async function removeCompanyPhoto(url: string) {
  const { profile } = await requireCompanyProfile();
  const photos = parseArray<string>(profile.photos).filter((p) => p !== url);
  await db.update(companyProfiles).set({ photos: toJsonArray(photos) }).where(eq(companyProfiles.id, profile.id));
  revalidatePath('/company/dashboard/profile');
  revalidatePath(`/companies/${profile.slug}`);
}

export async function addCompanyVideo(formData: FormData) {
  const { profile } = await requireCompanyProfile();
  const url = str(formData, 'url');
  if (!url) return;
  const videos = parseArray<string>(profile.videos);
  await db.update(companyProfiles).set({ videos: toJsonArray([...videos, url]) }).where(eq(companyProfiles.id, profile.id));
  revalidatePath('/company/dashboard/profile');
  revalidatePath(`/companies/${profile.slug}`);
}

export async function removeCompanyVideo(url: string) {
  const { profile } = await requireCompanyProfile();
  const videos = parseArray<string>(profile.videos).filter((v) => v !== url);
  await db.update(companyProfiles).set({ videos: toJsonArray(videos) }).where(eq(companyProfiles.id, profile.id));
  revalidatePath('/company/dashboard/profile');
  revalidatePath(`/companies/${profile.slug}`);
}

export async function submitCompanyVerification(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const { profile } = await requireCompanyProfile();
  const taxId = str(formData, 'taxId');
  if (!taxId) return { error: 'Indica el CIF/NIF del negocio.' };

  const verificationProofUrl = str(formData, 'verificationProofUrl');
  if (!verificationProofUrl) return { error: 'Comparte un enlace a tu ficha de Google Maps o a tu web oficial.' };

  const verificationNote = str(formData, 'verificationNote') || null;

  await db
    .update(companyProfiles)
    .set({
      verificationStatus: 'PENDING',
      verificationNote,
      verificationProofUrl,
      taxId,
      updatedAt: new Date().toISOString()
    })
    .where(eq(companyProfiles.id, profile.id));

  revalidatePath('/company/dashboard/profile');
  return { success: true };
}

// ---- Shared: change password ----

export async function changePassword(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Debes iniciar sesión.' };

  const currentPassword = str(formData, 'currentPassword');
  const newPassword = str(formData, 'newPassword');
  if (newPassword.length < 8) return { error: 'La nueva contraseña debe tener al menos 8 caracteres.' };

  const row = await db.query.users.findFirst({ where: eq(users.id, user.id) });
  if (!row) return { error: 'Usuario no encontrado.' };

  const valid = await verifyPassword(currentPassword, row.passwordHash);
  if (!valid) return { error: 'La contraseña actual no es correcta.' };

  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));

  return { success: true };
}
