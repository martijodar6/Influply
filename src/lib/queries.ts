import { db } from '@/db';
import {
  campaigns,
  companyProfiles,
  applications,
  creatorProfiles,
  favorites,
  socialNetworks,
  portfolioItems,
  users,
  campaignInvitations,
  conversations,
  messages
} from '@/db/schema';
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

// --- Campaign invitations (company invites a creator directly) -----------

/** Invitations sent to a creator, newest first, with the campaign + company they're for. */
export async function listInvitationsForCreator(creatorId: string) {
  const rows = await db
    .select({
      id: campaignInvitations.id,
      status: campaignInvitations.status,
      message: campaignInvitations.message,
      createdAt: campaignInvitations.createdAt,
      campaignId: campaigns.id,
      title: campaigns.title,
      category: campaigns.category,
      location: campaigns.location,
      companyName: companyProfiles.name,
      companySlug: companyProfiles.slug,
      companyLogoUrl: companyProfiles.logoUrl
    })
    .from(campaignInvitations)
    .innerJoin(campaigns, eq(campaignInvitations.campaignId, campaigns.id))
    .innerJoin(companyProfiles, eq(campaignInvitations.companyId, companyProfiles.id))
    .where(eq(campaignInvitations.creatorId, creatorId))
    .orderBy(desc(campaignInvitations.createdAt));
  return rows;
}

/** Ids of creators already invited to a campaign, so the invite UI can skip them. */
export async function getInvitedCreatorIdsForCampaign(campaignId: string): Promise<Set<string>> {
  const rows = await db
    .select({ creatorId: campaignInvitations.creatorId })
    .from(campaignInvitations)
    .where(eq(campaignInvitations.campaignId, campaignId));
  return new Set(rows.map((r) => r.creatorId));
}

// --- In-app messaging ------------------------------------------------------

export type ConversationRow = {
  id: string;
  updatedAt: string;
  otherName: string;
  otherAvatarUrl: string | null;
  otherHref: string;
  lastMessage: string | null;
  unreadCount: number;
};

/** Conversations for a creator's inbox, most recently active first. */
export async function listConversationsForCreator(creatorId: string): Promise<ConversationRow[]> { const rows = await db
    .select({
      id: conversations.id,
      updatedAt: conversations.updatedAt,
      companyId: companyProfiles.id,
      companyName: companyProfiles.name,
      companySlug: companyProfiles.slug,
      companyLogoUrl: companyProfiles.logoUrl
    })
    .from(conversations)
    .innerJoin(companyProfiles, eq(conversations.companyId, companyProfiles.id))
    .where(eq(conversations.creatorId, creatorId))
    .orderBy(desc(conversations.updatedAt));
  return attachMessagePreview(
    rows.map((r) => ({ id: r.id, updatedAt: r.updatedAt, otherName: r.companyName, otherAvatarUrl: r.companyLogoUrl, otherHref: `/companies/${r.companySlug}` })),
    creatorId,
    'creator'
  );
}

/** Conversations for a company's inbox, most recently active first. */
export async function listConversationsForCompany(companyId: string): Promise<ConversationRow[]> {
  const rows = await db
    .select({
      id: conversations.id,
      updatedAt: conversations.updatedAt,
      creatorId: creatorProfiles.id,
      creatorName: creatorProfiles.displayName,
      creatorUsername: creatorProfiles.username,
      creatorAvatarUrl: creatorProfiles.avatarUrl
    })
    .from(conversations)
    .innerJoin(creatorProfiles, eq(conversations.creatorId, creatorProfiles.id))
    .where(eq(conversations.companyId, companyId))
    .orderBy(desc(conversations.updatedAt));
  return attachMessagePreview(
    rows.map((r) => ({ id: r.id, updatedAt: r.updatedAt, otherName: r.creatorName, otherAvatarUrl: r.creatorAvatarUrl, otherHref: `/creators/${r.creatorUsername}` })),
    companyId,
    'company'
  );
}

async function attachMessagePreview(
  rows: { id: string; updatedAt: string; otherName: string; otherAvatarUrl: string | null; otherHref: string }[],
  _ownerId: string,
  _side: 'creator' | 'company'
): Promise<ConversationRow[]> {
  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return [];
  const msgs = await db
    .select({ conversationId: messages.conversationId, body: messages.body, senderUserId: messages.senderUserId, read: messages.read, createdAt: messages.createdAt })
    .from(messages)
    .where(inArray(messages.conversationId, ids))
    .orderBy(desc(messages.createdAt));

  return rows.map((r) => {
    const forThis = msgs.filter((m) => m.conversationId === r.id);
    return {
      ...r,
      lastMessage: forThis[0]?.body ?? null,
      unreadCount: forThis.filter((m) => !m.read).length
    };
  });
}

/** Finds an existing conversation between a creator and a company, if any. */
export async function findConversation(creatorId: string, companyId: string) {
  return db.query.conversations.findFirst({ where: and(eq(conversations.creatorId, creatorId), eq(conversations.companyId, companyId)) });
}

export async function getConversationById(id: string) {
  const convo = await db.query.conversations.findFirst({ where: eq(conversations.id, id) });
  if (!convo) return null;
  const [creator, company] = await Promise.all([
    db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.id, convo.creatorId) }),
    db.query.companyProfiles.findFirst({ where: eq(companyProfiles.id, convo.companyId) })
  ]);
  if (!creator || !company) return null;
  return { ...convo, creator, company };
}

/** Messages in a conversation, oldest first, with the sender's role for styling. */
export async function listMessages(conversationId: string) {
  const rows = await db
    .select({ id: messages.id, body: messages.body, createdAt: messages.createdAt, read: messages.read, senderUserId: messages.senderUserId, senderRole: users.role })
    .from(messages)
    .innerJoin(users, eq(messages.senderUserId, users.id))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
  return rows;
}
