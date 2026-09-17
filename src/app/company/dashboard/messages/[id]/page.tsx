import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DashboardShell, companyNavItems } from '@/components/dashboard-shell';
import { requireCompanyProfile } from '@/lib/guards';
import { getConversationById, listMessages } from '@/lib/queries';
import { markConversationRead } from '@/actions/messages';
import { MessageThread } from '@/components/message-thread';

export default async function CompanyConversationPage({ params }: { params: { id: string } }) {
  const { user, profile } = await requireCompanyProfile();
  const convo = await getConversationById(params.id);
  if (!convo || convo.companyId !== profile.id) notFound();

  await markConversationRead(convo.id);
  const msgs = await listMessages(convo.id);

  return (
    <DashboardShell items={companyNavItems} activePath="/company/dashboard/messages" userName={user.name ?? ''} role={user.role}>
      <div className="mb-4">
        <Link href="/company/dashboard/messages" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          ‹ Mensajes
        </Link>
      </div>
      <div className="mb-4 flex items-center gap-3">
        <div className="relative h-11 w-11 flex-none overflow-hidden rounded-full bg-ink-100">
          {convo.creator.avatarUrl && <Image src={convo.creator.avatarUrl} alt={convo.creator.displayName} fill className="object-cover" unoptimized />}
        </div>
        <div>
          <Link href={`/creators/${convo.creator.username}`} className="font-semibold text-ink-900 hover:text-brand-700">
            {convo.creator.displayName}
          </Link>
          <div className="text-xs text-ink-500">@{convo.creator.username}</div>
        </div>
      </div>
      <MessageThread conversationId={convo.id} initialMessages={msgs} currentUserId={user.id} />
    </DashboardShell>
  );
}
