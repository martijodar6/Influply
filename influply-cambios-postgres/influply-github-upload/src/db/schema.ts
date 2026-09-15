// Influply — data model (Drizzle ORM, Postgres dialect via Neon).
//
// Timestamp columns use Postgres `timestamp` with `mode: 'string'` so they
// keep behaving like plain ISO strings everywhere else in the app (queries,
// components) exactly as they did under SQLite — no call-site changes
// needed. List-like fields (categories, requirements, contentRequested, ...)
// stay JSON text columns — encode/decode helpers live in src/lib/json.ts.
// Role/status/type fields are plain strings validated in the app layer
// (src/lib/constants.ts).
import { pgTable, text, integer, real, boolean, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { randomUUID } from 'crypto';

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID());

const timestamps = {
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
};

// --- Auth & identity -------------------------------------------------

export const users = pgTable('users', {
  id: id(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(), // "CREATOR" | "COMPANY" | "ADMIN"
  name: text('name'),
  ...timestamps,
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
    usedAt: timestamp('used_at', { mode: 'string' }),
    ...timestamps,
  },
  (t) => ({
    userIdx: index('reset_user_idx').on(t.userId),
  })
);

// --- Creator side ------------------------------------------------------

export const creatorProfiles = pgTable(
  'creator_profiles',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    displayName: text('display_name').notNull(),
    username: text('username').notNull().unique(),
    avatarUrl: text('avatar_url'),
    coverPhotoUrl: text('cover_photo_url'),
    city: text('city'),
    bio: text('bio'),
    categories: text('categories').notNull().default('[]'),
    // Free-text niche tags the creator adds themselves (e.g. "Automotive"),
    // on top of the fixed CREATOR_CATEGORIES checklist — lets a profile be
    // as specific as the creator wants without us pre-enumerating every niche.
    customNiches: text('custom_niches').notNull().default('[]'),
    languages: text('languages').notNull().default('[]'),
    brandsWorkedWith: text('brands_worked_with').notNull().default('[]'),
    priceApprox: text('price_approx'),
    availability: text('availability'),
    // "Get Discovered" targeting data — optional, used so companies can filter
    // by audience fit; never shown on the public profile.
    dateOfBirth: text('date_of_birth'),
    gender: text('gender'),
    onboardingDone: boolean('onboarding_done').notNull().default(false),
    ...timestamps,
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (t) => ({
    cityIdx: index('creator_city_idx').on(t.city),
  })
);

export const portfolioItems = pgTable(
  'portfolio_items',
  {
    id: id(),
    creatorId: text('creator_id')
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // "PHOTO" | "VIDEO"
    url: text('url'),
    externalVideoUrl: text('external_video_url'),
    caption: text('caption'),
    brand: text('brand'),
    order: integer('order').notNull().default(0),
    ...timestamps,
  },
  (t) => ({
    creatorIdx: index('portfolio_creator_idx').on(t.creatorId),
  })
);

export const socialNetworks = pgTable(
  'social_networks',
  {
    id: id(),
    creatorId: text('creator_id')
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    platform: text('platform').notNull(), // INSTAGRAM | TIKTOK | YOUTUBE | OTHER
    handle: text('handle').notNull(),
    followers: integer('followers'),
    engagementRate: real('engagement_rate'),
  },
  (t) => ({
    creatorIdx: index('social_creator_idx').on(t.creatorId),
  })
);

// --- Company side --------------------------------------------------------

export const companyProfiles = pgTable(
  'company_profiles',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    logoUrl: text('logo_url'),
    coverPhotoUrl: text('cover_photo_url'),
    category: text('category').notNull(),
    city: text('city'),
    description: text('description'),
    website: text('website'),
    instagram: text('instagram'),
    tiktok: text('tiktok'),
    photos: text('photos').notNull().default('[]'),
    videos: text('videos').notNull().default('[]'),
    onboardingDone: boolean('onboarding_done').notNull().default(false),
    ...timestamps,
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (t) => ({
    cityIdx: index('company_city_idx').on(t.city),
  })
);

// --- Campaigns & applications ------------------------------------------

export const campaigns = pgTable(
  'campaigns',
  {
    id: id(),
    companyId: text('company_id')
      .notNull()
      .references(() => companyProfiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    objective: text('objective'),
    category: text('category').notNull(),
    location: text('location').notNull(),
    startDate: text('start_date'),
    applicationDeadline: text('application_deadline'),
    creatorTypes: text('creator_types').notNull().default('[]'),
    requirements: text('requirements').notNull().default('{}'),
    compensationTypes: text('compensation_types').notNull().default('[]'),
    budgetApprox: text('budget_approx'),
    contentRequested: text('content_requested').notNull().default('[]'),
    coverImageUrl: text('cover_image_url'),
    status: text('status').notNull().default('ACTIVE'), // DRAFT | ACTIVE | CLOSED
    ...timestamps,
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (t) => ({
    categoryIdx: index('campaign_category_idx').on(t.category),
    locationIdx: index('campaign_location_idx').on(t.location),
    statusIdx: index('campaign_status_idx').on(t.status),
  })
);

export const applications = pgTable(
  'applications',
  {
    id: id(),
    campaignId: text('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    creatorId: text('creator_id')
      .notNull()
      .references(() => creatorProfiles.id, { onDelete: 'cascade' }),
    message: text('message'),
    status: text('status').notNull().default('PENDING'), // PENDING | ACCEPTED | REJECTED | COMPLETED
    ...timestamps,
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (t) => ({
    uniqueApplication: uniqueIndex('application_campaign_creator_idx').on(t.campaignId, t.creatorId),
    statusIdx: index('application_status_idx').on(t.status),
  })
);

// --- Cross-cutting --------------------------------------------------------

export const favorites = pgTable(
  'favorites',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    targetType: text('target_type').notNull(), // "CREATOR" | "CAMPAIGN"
    targetId: text('target_id').notNull(),
    ...timestamps,
  },
  (t) => ({
    uniqueFavorite: uniqueIndex('favorite_user_target_idx').on(t.userId, t.targetType, t.targetId),
    targetIdx: index('favorite_target_idx').on(t.targetType, t.targetId),
  })
);

export const notifications = pgTable(
  'notifications',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    message: text('message').notNull(),
    read: boolean('read').notNull().default(false),
    relatedUrl: text('related_url'),
    ...timestamps,
  },
  (t) => ({
    userReadIdx: index('notification_user_read_idx').on(t.userId, t.read),
  })
);
