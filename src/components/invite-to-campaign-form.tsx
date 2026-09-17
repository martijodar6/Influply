'use client';

import { useState, useTransition } from 'react';
import { inviteCreatorToCampaign } from '@/actions/invitations';
import { Button, Select, Textarea } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';

export function InviteToCampaignForm({ creatorId, campaigns }: { creatorId: string; campaigns: { id: string; title: string }[] }) {
  const [open, setOpen] = useState(false);
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? '');
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const { show } = useToast();

  if (campaigns.length === 0) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl2 border border-dashed border-brand-200 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
      >
        + Invitar a campaña
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl2 border border-ink-100 bg-white p-3">
      <Select value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </Select>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Mensaje (opcional)"
        className="min-h-[60px]"
      />
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const res = await inviteCreatorToCampaign(campaignId, creatorId, message);
              if (res?.error) {
                show(res.error, 'error');
              } else {
                show('Invitación enviada.');
                setOpen(false);
                setMessage('');
              }
            });
          }}
        >
          Enviar invitación
        </Button>
        <Button variant="ghost" disabled={pending} onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
