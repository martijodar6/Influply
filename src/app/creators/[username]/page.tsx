import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PublicNavbar } from '@/components/public-navbar';
import { Badge, Card } from '@/components/ui/primitives';
import { FavoriteButton } from '@/components/favorite-button';
import { SocialPlatformIcon } from '@/components/social-icons';
import { VerifiedBadge } from '@/components/verified-badge';
import { getCreatorDetailByUsername, isFavorite } from '@/lib/queries';
import { getCurrentUser } from '@/lib/session';
import { getSocialProfileUrl } from '@/lib/social';
import { SOCIAL_PLATFORM_LABEL, type SocialPlatform } from '@/lib/constants';

export default async function CreatorProfilePage({ params }: { params: { username: string } }) {
  const [creator, user] = await Promise.all([getCreatorDetailByUsername(params.username), getCurrentUser()]);
  if (!creator) notFound();

  const favorite = user ? await isFavorite(user.id, 'CREATOR', creator.id) : false;
  const totalFollowers = creator.socials.reduce((sum, s) => sum + (s.followers ?? 0), 0);
  const photos = creator.portfolio.filter((p) => p.type === 'PHOTO');
  const videos = creator.portfolio.filter((p) => p.type === 'VIDEO');

  return (
    <div className="min-h-screen bg-[#faf9ff]">
      <PublicNavbar />
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="mb-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 flex-none overflow-hidden rounded-full bg-ink-100 ring-4 ring-white">
              {creator.avatarUrl && <Image src={creator.avatarUrl} alt={creator.displayName} fill className="object-cover" unoptimized />}
            </div>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-ink-900">
                {creator.displayName}
                {creator.verificationStatus === 'VERIFIED' && <VerifiedBadge size={18} />}
              </h1>
              <p className="text-sm text-ink-500">
                @{creator.username} {creator.city ? `· ${creator.city}` : ''}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {creator.categories.map((c) => (
                  <Badge key={c} tone="brand">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          {user?.role === 'COMPANY' && <FavoriteButton targetType="CREATOR" targetId={creator.id} initial={favorite} />}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            {creator.bio && (
              <Card>
                <h2 className="mb-2 font-semibold text-ink-900">Sobre mí</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{creator.bio}</p>
              </Card>
            )}

            {photos.length > 0 && (
              <Card>
                <h2 className="mb-3 font-semibold text-ink-900">Portfolio</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((p) => (
                    <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl2 bg-ink-100">
                      {p.url && <Image src={p.url} alt={p.caption ?? ''} fill className="object-cover" unoptimized />}
                      {p.brand && (
                        <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                          {p.brand}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {videos.length > 0 && (
              <Card>
                <h2 className="mb-3 font-semibold text-ink-900">Vídeos</h2>
                <div className="flex flex-col gap-2">
                  {videos.map((v) => (
                    <a
                      key={v.id}
                      href={v.externalVideoUrl ?? v.url ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl2 border border-ink-100 p-3 text-sm font-medium text-brand-700 hover:bg-brand-50"
                    >
                      <PlayIcon />
                      {v.caption || v.externalVideoUrl}
                    </a>
                  ))}
                </div>
              </Card>
            )}

            {creator.brandsWorkedWith.length > 0 && (
              <Card>
                <h2 className="mb-3 font-semibold text-ink-900">Marcas con las que ha trabajado</h2>
                <div className="flex flex-wrap gap-2">
                  {creator.brandsWorkedWith.map((b) => (
                    <Badge key={b}>{b}</Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <h2 className="mb-3 font-semibold text-ink-900">Redes sociales</h2>
              <div className="flex flex-col gap-1">
                {creator.socials.map((s) => {
                  const platform = s.platform as SocialPlatform;
                  const label = SOCIAL_PLATFORM_LABEL[platform] ?? s.platform;
                  const url = getSocialProfileUrl(platform, s.handle);
                  const content = (
                    <>
                      <span className="flex items-center gap-2 font-medium text-ink-900">
                        <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-50 text-brand-700">
                          <SocialPlatformIcon platform={platform} size={15} />
                        </span>
                        {label}
                      </span>
                      <span className="text-ink-500">
                        {s.handle} {s.followers ? `· ${s.followers.toLocaleString('es-ES')}` : ''}
                      </span>
                    </>
                  );
                  return url ? (
                    <a
                      key={s.id}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="-mx-1.5 flex items-center justify-between rounded-lg px-1.5 py-1 text-sm transition-colors hover:bg-brand-50"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={s.id} className="-mx-1.5 flex items-center justify-between px-1.5 py-1 text-sm">
                      {content}
                    </div>
                  );
                })}
                {creator.socials.length === 0 && <p className="text-sm text-ink-400">Sin redes añadidas.</p>}
              </div>
              {totalFollowers > 0 && (
                <div className="mt-3 border-t border-ink-100 pt-3 text-sm font-semibold text-ink-900">
                  {totalFollowers.toLocaleString('es-ES')} seguidores en total
                </div>
              )}
            </Card>

            {creator.languages.length > 0 && (
              <Card>
                <h2 className="mb-2 font-semibold text-ink-900">Idiomas</h2>
                <div className="flex flex-wrap gap-1.5">
                  {creator.languages.map((l) => (
                    <Badge key={l}>{l}</Badge>
                  ))}
                </div>
              </Card>
            )}

            {(creator.priceApprox || creator.availability) && (
              <Card>
                {creator.priceApprox && (
                  <div className="mb-2">
                    <div className="text-xs text-ink-400">Precio orientativo</div>
                    <div className="text-sm font-medium text-ink-900">{creator.priceApprox}</div>
                  </div>
                )}
                {creator.availability && (
                  <div>
                    <div className="text-xs text-ink-400">Disponibilidad</div>
                    <div className="text-sm font-medium text-ink-900">{creator.availability}</div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7-11-7z" />
    </svg>
  );
}
