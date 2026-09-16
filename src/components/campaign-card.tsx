import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/primitives';
import { COMPENSATION_TYPE_LABEL } from '@/lib/constants';
import type { CampaignCard as CampaignCardType } from '@/lib/queries';
import { FavoriteButton } from '@/components/favorite-button';
import { VerifiedBadge } from '@/components/verified-badge';

export function CampaignCard({ campaign, isFavorite, canFavorite }: { campaign: CampaignCardType; isFavorite?: boolean; canFavorite?: boolean }) {
  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="group flex flex-col overflow-hidden rounded-xl2 border border-ink-100 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-40 w-full bg-gradient-to-br from-brand-100 to-accent-400/40">
        {campaign.coverImageUrl && <Image src={campaign.coverImageUrl} alt={campaign.title} fill className="object-cover" unoptimized />}
        {canFavorite && (
          <div className="absolute right-3 top-3">
            <FavoriteButton targetType="CAMPAIGN" targetId={campaign.id} initial={Boolean(isFavorite)} />
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <Badge tone="brand">{campaign.category}</Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-ink-500">
          {campaign.company.logoUrl ? (
            <Image src={campaign.company.logoUrl} alt="" width={20} height={20} className="rounded-full object-cover" unoptimized />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink-100 text-[10px] font-bold">
              {campaign.company.name[0]}
            </span>
          )}
          {campaign.company.name}
          {campaign.company.verificationStatus === 'VERIFIED' && <VerifiedBadge size={13} />}
        </div>
        <h3 className="font-semibold text-ink-900 group-hover:text-brand-700">{campaign.title}</h3>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-ink-500">
          <span>{campaign.location}</span>
          <span>·</span>
          <span>{campaign.compensationTypes.map((c) => COMPENSATION_TYPE_LABEL[c as keyof typeof COMPENSATION_TYPE_LABEL] ?? c).join(', ')}</span>
        </div>
        <div className="flex items-center justify-between border-t border-ink-100 pt-2 text-xs text-ink-400">
          <span>{campaign.budgetApprox || 'Compensación a convenir'}</span>
          <span>{campaign.applicantCount} candidatos</span>
        </div>
      </div>
    </Link>
  );
}
