import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DashboardShell, creatorNavItems } from '@/components/dashboard-shell';
import { requireCreatorProfile } from '@/lib/guards';
import { getConversationById, listMessages } from '@/lib/queries';
import { markConversationRead } from '@/actions/messages';
import { MessageThread } from '@/components/message-thread';

export default async function CreatorConversationPage({ params }: { params: { id: string } }) {
  const { user, profile } = await requireCreatorProfile();
  const convo = await getConversationById(params.id);
  if (!convo || convo.creatorId !== profile.id) notFound();

  await markConversationRead(convo.id);
  const msgs = await listMessages(convo.id);

  return (
    <DashboardShell items={creatorNavItems} activePath="/creator/dashboard/messages" userName={user.name ?? ''} role={user.role}>
      <div className="mb-4">
        <Link href="/creator/dashboard/messages" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          ‹ Mensajes
        </Link>
      </div>
      <div className="mb-4 flex items-center gap-3">
        <div className="relative h-11 w-11 flex-none overflow-hidden rounded-full bg-ink-100">
          {convo.company.logoUrl && <Image src={convo.company.logoUrl} alt={convo.company.name} fill className="object-cover" unoptimized />}
        </div>
        <div>
          <Link href={`/companies/${convo.company.slug}`} className="font-semibold text-ink-900 hover:text-brand-700">
            {convo.company.name}
          </Link>
          <div className="text-xs text-ink-500">{convo.company.category}</div>
        </div>
      </div>
      <MessageThread conversationId={convo.id} initialMessages={msgs} currentUserId={user.id} />
    </DashboardShell>
  );
}
