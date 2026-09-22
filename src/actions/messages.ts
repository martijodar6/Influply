'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq, and, ne } from 'drizzle-orm';
import { db } from '@/db';
import { creatorProfiles, companyProfiles, conversations, messages, notifications } from '@/db/schema';
import { requireVerifiedUser } from '@/lib/session';

/** Called from a creator's public profile by a signed-in company. Opens (or creates) the conversation and sends there. */
export async function startConversationWithCreator(creatorId: string) {
  const user = await requireVerifiedUser();
  if (user.role !== 'COMPANY') return;

  const company = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.userId, user.id) });
  if (!company) redirect('/onboarding/company');

  let convo = await db.query.conversations.findFirst({
    where: (t, { and, eq }) => and(eq(t.creatorId, creatorId), eq(t.companyId, company.id))
  });
  if (!convo) {
    const id = randomUUID();
    await db.insert(conversations).values({ id, creatorId, companyId: company.id });
    convo = await db.query.conversations.findFirst({ where: eq(conversations.id, id) });
  }
  if (!convo) return;
  redirect(`/company/dashboard/messages/${convo.id}`);
}

/** Called from a company's public profile by a signed-in creator. Opens (or creates) the conversation and sends there. */
export async function startConversationWithCompany(companyId: string) {
  const user = await requireVerifiedUser();
  if (user.role !== 'CREATOR') return;

  const creator = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, user.id) });
  if (!creator) redirect('/onboarding/creator');

  let convo = await db.query.conversations.findFirst({
    where: (t, { and, eq }) => and(eq(t.creatorId, creator.id), eq(t.companyId, companyId))
  });
  if (!convo) {
    const id = randomUUID();
    await db.insert(conversations).values({ id, creatorId: creator.id, companyId });
    convo = await db.query.conversations.findFirst({ where: eq(conversations.id, id) });
  }
  if (!convo) return;
  redirect(`/creator/dashboard/messages/${convo.id}`);
}

export async function sendMessage(conversationId: string, body: string) {
  const user = await requireVerifiedUser();
  const trimmed = body.trim();
  if (!trimmed) return;

  const convo = await db.query.conversations.findFirst({ where: eq(conversations.id, conversationId) });
  if (!convo) return;

  const [creator, company] = await Promise.all([
    db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.id, convo.creatorId) }),
    db.query.companyProfiles.findFirst({ where: eq(companyProfiles.id, convo.companyId) })
  ]);
  const isCreator = Boolean(creator && creator.userId === user.id);
  const isCompany = Boolean(company && company.userId === user.id);
  if (!isCreator && !isCompany) return;

  await db.insert(messages).values({ id: randomUUID(), conversationId, senderUserId: user.id, body: trimmed });
  await db.update(conversations).set({ updatedAt: new Date().toISOString() }).where(eq(conversations.id, conversationId));

  const recipientUserId = isCreator ? company?.userId : creator?.userId;
  const senderName = isCreator ? creator?.displayName : company?.name;
  if (recipientUserId) {
    await db.insert(notifications).values({
      id: randomUUID(),
      userId: recipientUserId,
      type: 'NEW_MESSAGE',
      message: `Nuevo mensaje de ${senderName}.`,
      relatedUrl: isCreator ? `/company/dashboard/messages/${conversationId}` : `/creator/dashboard/messages/${conversationId}`
    });
  }

  revalidatePath(`/creator/dashboard/messages/${conversationId}`);
  revalidatePath(`/company/dashboard/messages/${conversationId}`);
  revalidatePath('/creator/dashboard/messages');
  revalidatePath('/company/dashboard/messages');
}

/** Marks every message from the other party as read. Called when opening a thread. */
export async function markConversationRead(conversationId: string) {
  const user = await requireVerifiedUser();
  await db.update(messages).set({ read: true }).where(and(eq(messages.conversationId, conversationId), ne(messages.senderUserId, user.id)));
}
