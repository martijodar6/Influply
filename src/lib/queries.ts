import { db } from '@/db';
import { campaigns, companyProfiles, applications, creatorProfiles, favorites, socialNetworks, portfolioItems, users } from '@/db/schema';
import { and, desc, eq, sql, inArray } from 'drizzle-orm';
import { parseArray, parseObject, CampaignRequirements, ContentRequestedItem } from './json';

export type CampaignCard = {
  id: string;
  title: string;
  category: string;
  location: string;
  coverImageUrl: string | null;
  compensationTypes: string[];
  budgetApprox: string | null;
  status: string;
  createdAt: string;
  applicationDeadline: string | null;
  applicantCount: number;
  mainPlatform: string | null;
  company: { name: string; slug: string; logoUrl: string | null; category: string; verificationStatus: string };
};

/** All ACTIVE campaigns with their company + applicant count, newest first. Used by the public marketplace. */
export async function listActiveCampaignCards(): Promise<CampaignCard[]> {
  const rows = await db
    .select({
      id: campaigns.id,
      title: campaigns.title,
      category: campaigns.category,
      location: campaigns.location,
      coverImageUrl: campaigns.coverImageUrl,
      compensationTypes: campaigns.compensationTypes,
      budgetApprox: campaigns.budgetApprox,
      status: campaigns.status,
      createdAt: campaigns.createdAt,
      applicationDeadline: campaigns.applicationDeadline,
      requirements: campaigns.requirements,
      companyName: companyProfiles.name,
      companySlug: companyProfiles.slug,
      companyLogoUrl: companyProfiles.logoUrl,
      companyCategory: companyProfiles.category,
      companyVerificationStatus: companyProfiles.verificationStatus
    })
    .from(campaigns)
    .innerJoin(companyProfiles, eq(campaigns.companyId, companyProfiles.id))
    .where(eq(campaigns.status, 'ACTIVE'))
    .orderBy(desc(campaigns.createdAt));

  const counts = await applicantCountsByCampaign(rows.map((r) => r.id));

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    location: r.location,
    coverImageUrl: r.coverImageUrl,
    compensationTypes: parseArray<string>(r.compensationTypes),
    budgetApprox: r.budgetApprox,
    status: r.status,
    createdAt: r.createdAt,
    applicationDeadline: r.applicationDeadline,
    applicantCount: counts.get(r.id) ?? 0,
    mainPlatform: parseObject<CampaignRequirements>(r.requirements, {}).mainPlatform ?? null,
    company: { name: r.companyName, slug: r.companySlug, logoUrl: r.companyLogoUrl, category: r.companyCategory, verificationStatus: r.companyVerificationStatus }
  }));
}

export async function applicantCountsByCampaign(campaignIds: string[]): Promise<Map<string, number>> {
  if (campaignIds.length === 0) return new Map();
  const rows = await db
    .select({ campaignId: applications.campaignId, count: sql<number>`count(*)` })
    .from(applications)
    .where(inArray(applications.campaignId, campaignIds))
    .groupBy(applications.campaignId);
  return new Map(rows.map((r) => [r.campaignId, Number(r.count)]));
}

export async function listCampaignsForCompany(companyId: string) {
  const rows = await db.query.campaigns.findMany({
    where: eq(campaigns.companyId, companyId),
    orderBy: (t, { desc }) => desc(t.createdAt)
  });
  const counts = await applicantCountsByCampaign(rows.map((r) => r.id));
  return rows.map((r) => ({ ...r, applicantCount: counts.get(r.id) ?? 0 }));
}

export async function getCampaignDetail(id: string) {
  const campaign = await db.query.campaigns.findFirst({ where: eq(campaigns.id, id) });
  if (!campaign) return null;
  const company = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.id, campaign.companyId) });
  if (!company) return null;
  const applicantCount = (await applicantCountsByCampaign([id])).get(id) ?? 0;

  return {
    ...campaign,
    creatorTypes: parseArray<string>(campaign.creatorTypes),
    compensationTypes: parseArray<string>(campaign.compensationTypes),
    contentRequested: parseArray<ContentRequestedItem>(campaign.contentRequested),
    requirements: parseObject<CampaignRequirements>(campaign.requirements, {}),
    applicantCount,
    company
  };
}

export async function listApplicationsForCampaign(campaignId: string) {
  const rows = await db
    .select({
      id: applications.id,
      message: applications.message,
      status: applications.status,
      createdAt: applications.createdAt,
      creatorId: creatorProfiles.id,
      displayName: creatorProfiles.displayName,
      username: creatorProfiles.username,
      avatarUrl: creatorProfiles.avatarUrl,
      city: creatorProfiles.city,
      categories: creatorProfiles.categories
    })
    .from(applications)
    .innerJoin(creatorProfiles, eq(applications.creatorId, creatorProfiles.id))
    .where(eq(applications.campaignId, campaignId))
    .orderBy(desc(applications.createdAt));

  const ids = rows.map((r) => r.creatorId);
  const socials = ids.length ? await db.select().from(socialNetworks).where(inArray(socialNetworks.creatorId, ids)) : [];

  return rows.map((r) => ({
    ...r,
    categories: parseArray<string>(r.categories),
    totalFollowers: socials.filter((s) => s.creatorId === r.creatorId).reduce((sum, s) => sum + (s.followers ?? 0), 0),
    socials: socials.filter((s) => s.creatorId === r.creatorId)
  }));
}

export type CreatorCard = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  city: string | null;
  categories: string[];
  topPhoto: string | null;
  verificationStatus: string;
  socials: { platform: string; handle: string; followers: number | null }[];
};

export async function listCreatorCards(): Promise<CreatorCard[]> {
  const rows = await db.query.creatorProfiles.findMany({ orderBy: (t, { desc }) => desc(t.createdAt) });
  const ids = rows.map((r) => r.id);
  const [socials, photos] = await Promise.all([
    ids.length ? db.select().from(socialNetworks).where(inArray(socialNetworks.creatorId, ids)) : Promise.resolve([]),
    ids.length ? db.select().from(portfolioItems).where(and(inArray(portfolioItems.creatorId, ids), eq(portfolioItems.type, 'PHOTO'))) : Promise.resolve([])
  ]);

  return rows.map((r) => ({
    id: r.id,
    displayName: r.displayName,
    username: r.username,
    avatarUrl: r.avatarUrl,
    city: r.city,
    categories: parseArray<string>(r.categories),
    topPhoto: photos.find((p) => p.creatorId === r.id)?.url ?? null,
    verificationStatus: r.verificationStatus,
    socials: socials
      .filter((s) => s.creatorId === r.id)
      .map((s) => ({ platform: s.platform, handle: s.handle, followers: s.followers }))
  }));
}

export async function getCreatorDetailByUsername(username: string) {
  const creator = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.username, username) });
  if (!creator) return null;
  const [socials, portfolio] = await Promise.all([
    db.select().from(socialNetworks).where(eq(socialNetworks.creatorId, creator.id)),
    db.select().from(portfolioItems).where(eq(portfolioItems.creatorId, creator.id)).orderBy(portfolioItems.order)
  ]);
  return {
    ...creator,
    categories: parseArray<string>(creator.categories),
    languages: parseArray<string>(creator.languages),
    brandsWorkedWith: parseArray<string>(creator.brandsWorkedWith),
    socials,
    portfolio
  };
}

export async function listApplicationsForCreator(creatorId: string) {
  const rows = await db
    .select({
      id: applications.id,
      status: applications.status,
      message: applications.message,
      createdAt: applications.createdAt,
      campaignId: campaigns.id,
      title: campaigns.title,
      category: campaigns.category,
      location: campaigns.location,
      companyName: companyProfiles.name,
      companySlug: companyProfiles.slug
    })
    .from(applications)
    .innerJoin(campaigns, eq(applications.campaignId, campaigns.id))
    .innerJoin(companyProfiles, eq(campaigns.companyId, companyProfiles.id))
    .where(eq(applications.creatorId, creatorId))
    .orderBy(desc(applications.createdAt));
  return rows;
}

export async function listFavoriteCampaigns(userId: string): Promise<CampaignCard[]> {
  const favRows = await db.query.favorites.findMany({ where: and(eq(favorites.userId, userId), eq(favorites.targetType, 'CAMPAIGN')) });
  const ids = new Set(favRows.map((f) => f.targetId));
  if (ids.size === 0) return [];
  const all = await listActiveOrAnyCampaignCards();
  return all.filter((c) => ids.has(c.id));
}

async function listActiveOrAnyCampaignCards(): Promise<CampaignCard[]> {
  const rows = await db
    .select({
      id: campaigns.id,
      title: campaigns.title,
      category: campaigns.category,
      location: campaigns.location,
      coverImageUrl: campaigns.coverImageUrl,
      compensationTypes: campaigns.compensationTypes,
      budgetApprox: campaigns.budgetApprox,
      status: campaigns.status,
      createdAt: campaigns.createdAt,
      applicationDeadline: campaigns.applicationDeadline,
      requirements: campaigns.requirements,
      companyName: companyProfiles.name,
      companySlug: companyProfiles.slug,
      companyLogoUrl: companyProfiles.logoUrl,
      companyCategory: companyProfiles.category,
      companyVerificationStatus: companyProfiles.verificationStatus
    })
    .from(campaigns)
    .innerJoin(companyProfiles, eq(campaigns.companyId, companyProfiles.id))
    .orderBy(desc(campaigns.createdAt));
  const counts = await applicantCountsByCampaign(rows.map((r) => r.id));
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    location: r.location,
    coverImageUrl: r.coverImageUrl,
    compensationTypes: parseArray<string>(r.compensationTypes),
    budgetApprox: r.budgetApprox,
    status: r.status,
    createdAt: r.createdAt,
    applicationDeadline: r.applicationDeadline,
    applicantCount: counts.get(r.id) ?? 0,
    mainPlatform: parseObject<CampaignRequirements>(r.requirements, {}).mainPlatform ?? null,
    company: { name: r.companyName, slug: r.companySlug, logoUrl: r.companyLogoUrl, category: r.companyCategory, verificationStatus: r.companyVerificationStatus }
  }));
}

export async function listFavoriteCreators(userId: string): Promise<CreatorCard[]> {
  const favRows = await db.query.favorites.findMany({ where: and(eq(favorites.userId, userId), eq(favorites.targetType, 'CREATOR')) });
  const ids = new Set(favRows.map((f) => f.targetId));
  if (ids.size === 0) return [];
  const all = await listCreatorCards();
  return all.filter((c) => ids.has(c.id));
}

export async function getCompanyDetailBySlug(slug: string) {
  const company = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.slug, slug) });
  if (!company) return null;
  const rows = await db.query.campaigns.findMany({ where: eq(campaigns.companyId, company.id), orderBy: (t, { desc }) => desc(t.createdAt) });
  return {
    ...company,
    photos: parseArray<string>(company.photos),
    videos: parseArray<string>(company.videos),
    activeCampaigns: rows.filter((r) => r.status === 'ACTIVE'),
    pastCampaigns: rows.filter((r) => r.status !== 'ACTIVE')
  };
}

export async function isFavorite(userId: string, targetType: 'CREATOR' | 'CAMPAIGN', targetId: string) {
  const row = await db.query.favorites.findFirst({
    where: and(eq(favorites.userId, userId), eq(favorites.targetType, targetType), eq(favorites.targetId, targetId))
  });
  return Boolean(row);
}

// --- Admin: verification queue --------------------------------------------

export type CreatorVerificationRow = {
  id: string;
  displayName: string;
  username: string;
  email: string;
  verificationNote: string | null;
  updatedAt: string;
};

export type CompanyVerificationRow = {
  id: string;
  name: string;
  slug: string;
  email: string;
  taxId: string | null;
  verificationNote: string | null;
  updatedAt: string;
};

/** Creator profiles with a pending verification request, newest first. */
export async function listCreatorVerificationRequests(): Promise<CreatorVerificationRow[]> {
  return db
    .select({
      id: creatorProfiles.id,
      displayName: creatorProfiles.displayName,
      username: creatorProfiles.username,
      email: users.email,
      verificationNote: creatorProfiles.verificationNote,
      updatedAt: creatorProfiles.updatedAt
    })
    .from(creatorProfiles)
    .innerJoin(users, eq(creatorProfiles.userId, users.id))
    .where(eq(creatorProfiles.verificationStatus, 'PENDING'))
    .orderBy(desc(creatorProfiles.updatedAt));
}

/** Company profiles with a pending verification request, newest first. */
export async function listCompanyVerificationRequests(): Promise<CompanyVerificationRow[]> {
  return db
    .select({
      id: companyProfiles.id,
      name: companyProfiles.name,
      slug: companyProfiles.slug,
      email: users.email,
      taxId: companyProfiles.taxId,
      verificationNote: companyProfiles.verificationNote,
      updatedAt: companyProfiles.updatedAt
    })
    .from(companyProfiles)
    .innerJoin(users, eq(companyProfiles.userId, users.id))
    .where(eq(companyProfiles.verificationStatus, 'PENDING'))
    .orderBy(desc(companyProfiles.updatedAt));
}
