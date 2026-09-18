import { NextRequest, NextResponse } from 'next/server';
import { sql, eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';

// TEMPORARY, ONE-TIME SETUP ROUTE.
//
// Applies the verification-related schema changes directly against the
// production database (this build environment cannot reach it, but
// Vercel's serverless functions can). Protected by the SETUP_SECRET
// environment variable configured in the Vercel project settings — set
// it there, then visit this route once with ?secret=<that value>.
// Delete this whole route once it has been used.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const expected = process.env.SETUP_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const log: string[] = [];

  await db.execute(sql`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'UNVERIFIED'`);
  await db.execute(sql`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS verification_note text`);
  await db.execute(sql`ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS verified_at timestamp`);
  log.push('creator_profiles: columnas de verificación listas');

  await db.execute(sql`ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'UNVERIFIED'`);
  await db.execute(sql`ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS verification_note text`);
  await db.execute(sql`ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS verified_at timestamp`);
  await db.execute(sql`ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS tax_id text`);
  log.push('company_profiles: columnas de verificación listas');

  // Campaign invitations + in-app messaging (companies inviting creators
  // directly, and a free-for-everyone chat between creators and companies).
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS campaign_invitations (
      id text PRIMARY KEY,
      campaign_id text NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      creator_id text NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
      company_id text NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
      message text,
      status text NOT NULL DEFAULT 'PENDING',
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS invitation_campaign_creator_idx ON campaign_invitations (campaign_id, creator_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS invitation_creator_idx ON campaign_invitations (creator_id)`);
  log.push('campaign_invitations: tabla lista');

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS conversations (
      id text PRIMARY KEY,
      creator_id text NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
      company_id text NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS conversation_creator_company_idx ON conversations (creator_id, company_id)`);
  log.push('conversations: tabla lista');

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS messages (
      id text PRIMARY KEY,
      conversation_id text NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body text NOT NULL,
      read boolean NOT NULL DEFAULT false,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS message_conversation_idx ON messages (conversation_id)`);
  log.push('messages: tabla lista');

  // Ad-review workflow: a campaign only shows up in the public marketplace
  // once an admin approves it from /admin/campaigns.
  await db.execute(sql`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'PENDING'`);
  log.push('campaigns: columna de revisión lista');

  // Signup email verification: a 6-digit code, checked in /verify-email
  // before onboarding is reachable (src/lib/session.ts). Existing accounts
  // are grandfathered in as verified — the code flow only applies to
  // accounts created from here on.
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at timestamp`);
  await db.execute(sql`UPDATE users SET email_verified_at = created_at WHERE email_verified_at IS NULL`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS email_verification_codes (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code text NOT NULL,
      expires_at timestamp NOT NULL,
      used_at timestamp,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS email_verification_user_idx ON email_verification_codes (user_id)`);
  log.push('users/email_verification_codes: verificación de email lista (cuentas existentes marcadas como verificadas)');

  const makeAdmin = searchParams.get('makeAdmin');
  if (makeAdmin) {
    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.email, makeAdmin));
    log.push(`usuario promovido a ADMIN: ${makeAdmin}`);
  }

  const allUsers = await db.select({ email: users.email, role: users.role, name: users.name, createdAt: users.createdAt }).from(users);

  return NextResponse.json({ ok: true, log, users: allUsers });
}
