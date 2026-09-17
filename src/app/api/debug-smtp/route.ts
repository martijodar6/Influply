import { NextRequest, NextResponse } from 'next/server';

// TEMPORARY DIAGNOSTIC ROUTE — delete once SMTP is confirmed working.
//
// Reports ONLY booleans (never any part of the actual secret values) for
// whether the SMTP_* env vars are visible to this deployment's server
// runtime. Protected by the same SETUP_SECRET used by
// /api/setup-verification.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const expected = process.env.SETUP_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    hasHost: Boolean(process.env.SMTP_HOST),
    hasPort: Boolean(process.env.SMTP_PORT),
    hasUser: Boolean(process.env.SMTP_USER),
    hasPassword: Boolean(process.env.SMTP_PASSWORD),
    hasFrom: Boolean(process.env.SMTP_FROM),
    vercelEnv: process.env.VERCEL_ENV ?? null,
  });
}
