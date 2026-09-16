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

  const makeAdmin = searchParams.get('makeAdmin');
  if (makeAdmin) {
    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.email, makeAdmin));
    log.push(`usuario promovido a ADMIN: ${makeAdmin}`);
  }

  const allUsers = await db.select({ email: users.email, role: users.role, name: users.name, createdAt: users.createdAt }).from(users);

  return NextResponse.json({ ok: true, log, users: allUsers });
}
