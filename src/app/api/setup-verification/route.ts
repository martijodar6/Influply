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

  const makeAdmin = searchParams.get('makeAdmin');
  if (makeAdmin) {
    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.email, makeAdmin));
    log.push(`usuario promovido a ADMIN: ${makeAdmin}`);
  }

  const allUsers = await db.select({ email: users.email, role: users.role, name: users.name, createdAt: users.createdAt }).from(users);

  return NextResponse.json({ ok: true, log, users: allUsers });
}
