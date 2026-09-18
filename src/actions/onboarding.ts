'use server';

import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import slugify from 'slugify';
import { db } from '@/db';
import { creatorProfiles, companyProfiles, portfolioItems, socialNetworks } from '@/db/schema';
import { getCurrentUser } from '@/lib/session';
import { saveUpload, UploadError } from '@/lib/storage';
import { toJsonArray } from '@/lib/json';

export type FormState = { error?: string } | null;

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

function fileOrNull(fd: FormData, key: string): File | null {
  const v = fd.get(key);
  return v instanceof File && v.size > 0 ? v : null;
}

async function uniqueUsername(base: string): Promise<string> {
  const slug = slugify(base || 'creador', { lower: true, strict: true }) || `creador-${randomUUID().slice(0, 6)}`;
  let candidate = slug;
  let i = 1;
  // Usernames are rare-write, low-cardinality lookups — a small retry loop
  // here is simpler and safer than a race-prone "check then insert".
  while (await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.username, candidate) })) {
    i += 1;
    candidate = `${slug}-${i}`;
  }
  return candidate;
}

async function uniqueSlug(base: string): Promise<string> {
  const slug = slugify(base || 'empresa', { lower: true, strict: true }) || `empresa-${randomUUID().slice(0, 6)}`;
  let candidate = slug;
  let i = 1;
  while (await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.slug, candidate) })) {
    i += 1;
    candidate = `${slug}-${i}`;
  }
  return candidate;
}

export async function completeCreatorOnboarding(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CREATOR') redirect('/login');
  if (!user.emailVerified) redirect('/verify-email');

  const existing = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, user.id) });
  if (existing) redirect('/creator/dashboard');

  const displayName = str(formData, 'displayName');
  if (!displayName) return { error: 'Escribe tu nombre.' };
  const city = str(formData, 'city') || null;
  const bio = str(formData, 'bio') || null;
  const categories = formData.getAll('categories').map(String);
  const languages = formData.getAll('languages').map(String);
  const priceApprox = str(formData, 'priceApprox') || null;
  const availability = str(formData, 'availability') || null;
  const brandsWorkedWith = str(formData, 'brandsWorkedWith')
    .split(',')
    .map((b) => b.trim())
    .filter(Boolean);

  let avatarUrl: string | null = null;
  const avatarFile = fileOrNull(formData, 'avatar');
  try {
    if (avatarFile) avatarUrl = await saveUpload(avatarFile, 'avatar');
  } catch (e) {
    return { error: e instanceof UploadError ? e.message : 'No se pudo subir la foto de perfil.' };
  }

  const username = await uniqueUsername(displayName);
  const creatorId = randomUUID();

  await db.insert(creatorProfiles).values({
    id: creatorId,
    userId: user.id,
    displayName,
    username,
    avatarUrl,
    city,
    bio,
    categories: toJsonArray(categories),
    languages: toJsonArray(languages),
    brandsWorkedWith: toJsonArray(brandsWorkedWith),
    priceApprox,
    availability,
    onboardingDone: true
  });

  // Social networks: up to 4 fixed rows from the form (platform_i/handle_i/followers_i).
  for (let i = 0; i < 4; i += 1) {
    const platform = str(formData, `social_platform_${i}`);
    const handle = str(formData, `social_handle_${i}`);
    if (!platform || !handle) continue;
    const followersRaw = str(formData, `social_followers_${i}`);
    await db.insert(socialNetworks).values({
      id: randomUUID(),
      creatorId,
      platform,
      handle,
      followers: followersRaw ? Number(followersRaw) || null : null
    });
  }

  // Portfolio: up to 6 photo slots + up to 2 external video slots.
  let order = 0;
  for (let i = 0; i < 6; i += 1) {
    const photo = fileOrNull(formData, `portfolio_photo_${i}`);
    if (!photo) continue;
    try {
      const url = await saveUpload(photo, 'portfolio-photo');
      const caption = str(formData, `portfolio_caption_${i}`) || null;
      const brand = str(formData, `portfolio_brand_${i}`) || null;
      await db.insert(portfolioItems).values({ id: randomUUID(), creatorId, type: 'PHOTO', url, caption, brand, order: order++ });
    } catch {
      // Skip a single bad file rather than failing the whole onboarding.
    }
  }
  for (let i = 0; i < 2; i += 1) {
    const externalVideoUrl = str(formData, `portfolio_video_url_${i}`);
    if (!externalVideoUrl) continue;
    const caption = str(formData, `portfolio_video_caption_${i}`) || null;
    await db.insert(portfolioItems).values({ id: randomUUID(), creatorId, type: 'VIDEO', externalVideoUrl, caption, order: order++ });
  }

  redirect('/creator/dashboard?welcome=1');
}

export async function completeCompanyOnboarding(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'COMPANY') redirect('/login');
  if (!user.emailVerified) redirect('/verify-email');

  const existing = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.userId, user.id) });
  if (existing) redirect('/company/dashboard');

  const name = str(formData, 'name');
  if (!name) return { error: 'Escribe el nombre de la empresa.' };
  const category = str(formData, 'category');
  if (!category) return { error: 'Elige una categoría.' };
  const city = str(formData, 'city') || null;
  const description = str(formData, 'description') || null;
  const website = str(formData, 'website') || null;
  const instagram = str(formData, 'instagram') || null;
  const tiktok = str(formData, 'tiktok') || null;

  let logoUrl: string | null = null;
  try {
    const logoFile = fileOrNull(formData, 'logo');
    if (logoFile) logoUrl = await saveUpload(logoFile, 'logo');
  } catch (e) {
    return { error: e instanceof UploadError ? e.message : 'No se pudo subir el logo.' };
  }

  const photos: string[] = [];
  try {
    for (let i = 0; i < 6; i += 1) {
      const photo = fileOrNull(formData, `photo_${i}`);
      if (!photo) continue;
      photos.push(await saveUpload(photo, 'business-photo'));
    }
  } catch {
    // Skip a bad file rather than failing the whole step.
  }

  const videos = Array.from({ length: 2 })
    .map((_, i) => str(formData, `video_url_${i}`))
    .filter(Boolean);

  const slug = await uniqueSlug(name);

  await db.insert(companyProfiles).values({
    id: randomUUID(),
    userId: user.id,
    name,
    slug,
    logoUrl,
    category,
    city,
    description,
    website,
    instagram,
    tiktok,
    photos: toJsonArray(photos),
    videos: toJsonArray(videos),
    onboardingDone: true
  });

  redirect('/company/dashboard?welcome=1');
}
