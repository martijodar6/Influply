'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { sendMessage } from '@/actions/messages';
import { Button, Textarea } from '@/components/ui/primitives';

type MessageRow = { id: string; body: string; createdAt: string; senderUserId: string };

// A deliberately simple inbox: no polling or websockets. The thread updates
// when you send a message (via router.refresh()) or when the page reloads.
export function MessageThread({
  conversationId,
  initialMessages,
  currentUserId
}: {
  conversationId: string;
  initialMessages: MessageRow[];
  currentUserId: string;
}) {
  const [body, setBody] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    const trimmed = body.trim();
    if (!trimmed || pending) return;
    startTransition(async () => {
      await sendMessage(conversationId, trimmed);
      setBody('');
      router.refresh();
    });
  }

  return (
    <div className="flex h-[60vh] flex-col rounded-xl2 border border-ink-100 bg-white">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {initialMessages.length === 0 && <p className="text-sm text-ink-400">Aún no hay mensajes. Escribe el primero.</p>}
        {initialMessages.map((m) => {
          const mine = m.senderUserId === currentUserId;
          return (
            <div
              key={m.id}
              className={clsx(
                'max-w-[75%] whitespace-pre-line rounded-xl2 px-4 py-2 text-sm',
                mine ? 'self-end bg-brand-500 text-white' : 'self-start bg-ink-100 text-ink-900'
              )}
            >
              {m.body}
              <div className={clsx('mt-1 text-[10px]', mine ? 'text-brand-100' : 'text-ink-400')}>
                {new Date(m.createdAt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 border-t border-ink-100 p-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="min-h-[44px] flex-1 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button disabled={pending || !body.trim()} onClick={submit}>
          Enviar
        </Button>
      </div>
    </div>
  );
}
