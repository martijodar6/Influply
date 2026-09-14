'use server';

import { z } from 'zod';
import { randomUUID } from 'crypto';
import { db } from '@/db';
import { users, passwordResetTokens } from '@/db/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { hashPassword } from '@/lib/password';
import { sendPasswordResetEmail } from '@/lib/mailer';

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

  return { ok: true, data: { userId: id } };
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
