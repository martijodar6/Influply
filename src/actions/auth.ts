'use server';

import { z } from 'zod';
import { randomUUID } from 'crypto';
import { db } from '@/db';
import { users, passwordResetTokens, emailVerificationCodes } from '@/db/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { hashPassword } from '@/lib/password';
import { sendPasswordResetEmail, sendVerificationCodeEmail } from '@/lib/mailer';
import { getCurrentUser } from '@/lib/session';

const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function generateSixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function issueVerificationCode(userId: string, email: string) {
  // Superseding any still-valid code keeps exactly one live code per user,
  // so an older resend can't be used once a newer one has been sent.
  await db
    .update(emailVerificationCodes)
    .set({ usedAt: new Date().toISOString() })
    .where(and(eq(emailVerificationCodes.userId, userId), isNull(emailVerificationCodes.usedAt)));

  const code = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS).toISOString();
  await db.insert(emailVerificationCodes).values({ id: randomUUID(), userId, code, expiresAt });

  // A transient email-delivery failure (provider rate limit, sandbox
  // restrictions, a momentary outage...) must not take down signup or
  // resend — the code is already stored, and "Reenviar código" on
  // /verify-email lets the user try again. Log it so it's visible in
  // server logs without crashing the caller.
  try {
    await sendVerificationCodeEmail(email, code);
  } catch (err) {
    console.error('[Influply] No se pudo enviar el código de verificación:', err);
  }
}

const signUpSchema = z.object({
  name: z.string().min(2, 'Escribe tu nombre'),
  email: z.string().email('Email no válido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  role: z.enum(['CREATOR', 'COMPANY'])
});

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

export async function registerUser(input: unknown): Promise<ActionResult<{ userId: string }>> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.data ? 'Datos no válidos' : parsed.error.issues[0]?.message ?? 'Datos no válidos' };
  }
  const { name, email, password, role } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await db.query.users.findFirst({ where: eq(users.email, normalizedEmail) });
  if (existing) {
    return { ok: false, error: 'Ya existe una cuenta con ese email.' };
  }

  const passwordHash = await hashPassword(password);
  const id = randomUUID();
  await db.insert(users).values({
    id,
    email: normalizedEmail,
    passwordHash,
    role,
    name
  });

  await issueVerificationCode(id, normalizedEmail);

  return { ok: true, data: { userId: id } };
}

const verifyEmailSchema = z.object({ code: z.string().trim().regex(/^\d{6}$/, 'Introduce el código de 6 dígitos.') });

export async function verifyEmailCode(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'Debes iniciar sesión.' };

  const parsed = verifyEmailSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Código no válido.' };

  const row = await db.query.emailVerificationCodes.findFirst({
    where: and(
      eq(emailVerificationCodes.userId, user.id),
      eq(emailVerificationCodes.code, parsed.data.code),
      isNull(emailVerificationCodes.usedAt),
      gt(emailVerificationCodes.expiresAt, new Date().toISOString())
    )
  });
  if (!row) return { ok: false, error: 'Código incorrecto o caducado.' };

  await db.update(emailVerificationCodes).set({ usedAt: new Date().toISOString() }).where(eq(emailVerificationCodes.id, row.id));
  await db.update(users).set({ emailVerifiedAt: new Date().toISOString() }).where(eq(users.id, user.id));

  return { ok: true };
}

export async function resendVerificationCode(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'Debes iniciar sesión.' };

  const row = await db.query.users.findFirst({ where: eq(users.id, user.id) });
  if (!row) return { ok: false, error: 'Debes iniciar sesión.' };
  if (row.emailVerifiedAt) return { ok: true };

  await issueVerificationCode(user.id, row.email);
  return { ok: true };
}

const forgotSchema = z.object({ email: z.string().email() });

export async function requestPasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = forgotSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Introduce un email válido.' };

  const email = parsed.data.email.toLowerCase().trim();
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });

  // Always respond the same way whether or not the email exists, so the
  // form can't be used to probe which emails are registered.
  if (user) {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1h
    await db.insert(passwordResetTokens).values({ id: randomUUID(), userId: user.id, token, expiresAt });

    const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${base}/reset-password/${token}`;
    await sendPasswordResetEmail(email, resetUrl);
  }

  return { ok: true };
}

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, 'Mínimo 8 caracteres')
});

export async function resetPassword(input: unknown): Promise<ActionResult> {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos no válidos' };

  const { token, password } = parsed.data;
  const row = await db.query.passwordResetTokens.findFirst({
    where: and(eq(passwordResetTokens.token, token), isNull(passwordResetTokens.usedAt), gt(passwordResetTokens.expiresAt, new Date().toISOString()))
  });

  if (!row) {
    return { ok: false, error: 'Este enlace de recuperación no es válido o ha caducado.' };
  }

  const passwordHash = await hashPassword(password);
  await db.update(users).set({ passwordHash }).where(eq(users.id, row.userId));
  await db.update(passwordResetTokens).set({ usedAt: new Date().toISOString() }).where(eq(passwordResetTokens.id, row.id));

  return { ok: true };
}
