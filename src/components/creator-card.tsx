import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/primitives';
import { FavoriteButton } from '@/components/favorite-button';
import type { CreatorCard as CreatorCardType } from '@/lib/queries';
import { SOCIAL_PLATFORM_LABEL } from '@/lib/constants';

export function CreatorCard({ creator, isFavorite, canFavorite }: { creator: CreatorCardType; isFavorite?: boolean; canFavorite?: boolean }) {
  const totalFollowers = creator.socials.reduce((sum, s) => sum + (s.followers ?? 0), 0);

  return (
    <Link
      href={`/creators/${creator.username}`}
      className="group flex flex-col overflow-hidden rounded-xl2 border border-ink-100 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-40 w-full bg-gradient-to-br from-accent-400/30 to-brand-100">
        {creator.topPhoto && <Image src={creator.topPhoto} alt="" fill className="object-cover" unoptimized />}
        {canFavorite && (
          <div className="absolute right-3 top-3">
            <FavoriteButton targetType="CREATOR" targetId={creator.id} initial={Boolean(isFavorite)} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <div className="relative h-9 w-9 flex-none overflow-hidden rounded-full bg-ink-100">
            {creator.avatarUrl && <Image src={creator.avatarUrl} alt={creator.displayName} fill className="object-cover" unoptimized />}
          </div>
          <div>
            <div className="font-semibold text-ink-900 group-hover:text-brand-700">{creator.displayName}</div>
            <div className="text-xs text-ink-500">@{creator.username}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {creator.categories.slice(0, 3).map((c) => (
            <Badge key={c}>{c}</Badge>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-ink-100 pt-2 text-xs text-ink-500">
          <span>{creator.city ?? 'Ubicación no indicada'}</span>
          <span>{totalFollowers > 0 ? `${totalFollowers.toLocaleString('es-ES')} seguidores` : creator.socials.map((s) => SOCIAL_PLATFORM_LABEL[s.platform as keyof typeof SOCIAL_PLATFORM_LABEL]).join(', ')}</span>
        </div>
      </div>
    </Link>
  );
}
