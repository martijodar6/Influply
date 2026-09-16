import Image from 'next/image';
import Link from 'next/link';
import { DashboardShell, creatorNavItems } from '@/components/dashboard-shell';
import { Card, Field, Input, Select, Textarea, Button, LinkButton, Badge } from '@/components/ui/primitives';
import { SocialPlatformIcon } from '@/components/social-icons';
import { requireCreatorProfile } from '@/lib/guards';
import { parseArray } from '@/lib/json';
import { getSocialProfileUrl } from '@/lib/social';
import { SOCIAL_PLATFORMS, SOCIAL_PLATFORM_LABEL, VERIFICATION_STATUS_LABEL, type SocialPlatform, type VerificationStatus } from '@/lib/constants';
import { db } from '@/db';
import { socialNetworks, portfolioItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { addSocialNetwork, deleteSocialNetwork, addPortfolioPhoto, addPortfolioVideo, deletePortfolioItem, submitCreatorVerification } from '@/actions/profile';
import { CreatorBasicInfoForm } from './basic-info-form';

export default async function CreatorProfilePage() {
  const { user, profile } = await requireCreatorProfile();
  const [socials, portfolio] = await Promise.all([
    db.select().from(socialNetworks).where(eq(socialNetworks.creatorId, profile.id)),
    db.select().from(portfolioItems).where(eq(portfolioItems.creatorId, profile.id)).orderBy(portfolioItems.order)
  ]);

  const enriched = {
    ...profile,
    categoriesList: parseArray<string>(profile.categories),
    languagesList: parseArray<string>(profile.languages),
    brandsList: parseArray<string>(profile.brandsWorkedWith)
  };

  return (
    <DashboardShell items={creatorNavItems} activePath="/creator/dashboard/profile" userName={user.name ?? ''} role={user.role}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Mi perfil</h1>
          <p className="text-sm text-ink-500">Así te ven las empresas.</p>
        </div>
        <LinkButton href={`/creators/${profile.username}`} variant="secondary">
          Ver perfil público →
        </LinkButton>
      </div>

      <Card className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Verificación</h2>
          <Badge
            tone={
              profile.verificationStatus === 'VERIFIED'
                ? 'success'
                : profile.verificationStatus === 'PENDING'
                ? 'warning'
                : profile.verificationStatus === 'REJECTED'
                ? 'danger'
                : 'neutral'
            }
          >
            {VERIFICATION_STATUS_LABEL[profile.verificationStatus as VerificationStatus] ?? 'Sin verificar'}
          </Badge>
        </div>
        {profile.verificationStatus === 'VERIFIED' && (
          <p className="text-sm text-ink-500">Tu perfil está verificado y muestra la insignia junto a tu nombre.</p>
        )}
        {profile.verificationStatus === 'PENDING' && (
          <p className="text-sm text-ink-500">Tu solicitud está en revisión. Te avisaremos en cuanto la resolvamos.</p>
        )}
        {(profile.verificationStatus === 'UNVERIFIED' || profile.verificationStatus === 'REJECTED') && (
          <form action={submitCreatorVerification} className="flex flex-col gap-3">
            <p className="text-sm text-ink-500">
              {profile.verificationStatus === 'REJECTED'
                ? 'Tu solicitud anterior fue rechazada. Puedes volver a enviarla.'
                : 'Comparte el enlace a tu perfil de Instagram, TikTok o YouTube (o cualquier prueba de que eres quien dices ser) y lo revisaremos.'}
            </p>
            <Textarea name="verificationNote" placeholder="Enlace a tu perfil u otra información que nos ayude a verificarte" required />
            <Button type="submit" variant="secondary" className="self-start">
              Solicitar verificación
            </Button>
          </form>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold text-ink-900">Datos básicos</h2>
          <CreatorBasicInfoForm profile={enriched} />
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="mb-4 font-semibold text-ink-900">Redes sociales</h2>
            <div className="mb-4 flex flex-col gap-2">
              {socials.map((s) => {
                const platform = s.platform as SocialPlatform;
                const url = getSocialProfileUrl(platform, s.handle);
                return (
                  <div key={s.id} className="flex items-center justify-between rounded-xl2 border border-ink-100 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-50 text-brand-700">
                        <SocialPlatformIcon platform={platform} size={13} />
                      </span>
                      <b>{SOCIAL_PLATFORM_LABEL[platform] ?? s.platform}</b> ·{' '}
                      {url ? (
                        <a href={url} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">
                          {s.handle}
                        </a>
                      ) : (
                        s.handle
                      )}{' '}
                      {s.followers ? `· ${s.followers.toLocaleString('es-ES')}` : ''}
                    </span>
                    <form action={deleteSocialNetwork.bind(null, s.id)}>
                      <button className="text-xs font-medium text-red-600 hover:underline">Eliminar</button>
                    </form>
                  </div>
                );
              })}
              {socials.length === 0 && <p className="text-sm text-ink-400">Aún no has añadido redes sociales.</p>}
            </div>
            <form action={addSocialNetwork} className="grid grid-cols-3 gap-2">
              <Select name="platform" defaultValue="">
                <option value="" disabled>
                  Plataforma
                </option>
                {SOCIAL_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {SOCIAL_PLATFORM_LABEL[p]}
                  </option>
                ))}
              </Select>
              <Input name="handle" placeholder="@usuario" required />
              <Input name="followers" type="number" min={0} placeholder="Seguidores" />
              <Button type="submit" variant="secondary" className="col-span-3">
                Añadir red social
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-4 font-semibold text-ink-900">Portfolio</h2>
            <div className="mb-4 grid grid-cols-3 gap-2">
              {portfolio
                .filter((p) => p.type === 'PHOTO')
                .map((p) => (
                  <div key={p.id} className="group relative aspect-square overflow-hidden rounded-xl2 bg-ink-100">
                    {p.url && <Image src={p.url} alt="" fill className="object-cover" unoptimized />}
                    <form action={deletePortfolioItem.bind(null, p.id)} className="absolute inset-x-0 bottom-0 bg-black/50 opacity-0 group-hover:opacity-100">
                      <button className="w-full py-1 text-xs font-medium text-white">Eliminar</button>
                    </form>
                  </div>
                ))}
            </div>
            <form action={addPortfolioPhoto} className="mb-4 flex flex-col gap-2 rounded-xl2 border border-dashed border-ink-100 p-3">
              <Field label="Añadir foto">
                <input type="file" name="photo" accept="image/png,image/jpeg,image/webp" required className="text-sm" />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Input name="caption" placeholder="Descripción (opcional)" />
                <Input name="brand" placeholder="Marca (opcional)" />
              </div>
              <Button type="submit" variant="secondary">
                Subir foto
              </Button>
            </form>

            <div className="mb-2 flex flex-col gap-2">
              {portfolio
                .filter((p) => p.type === 'VIDEO')
                .map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-xl2 border border-ink-100 px-3 py-2 text-sm">
                    <a href={v.externalVideoUrl ?? '#'} target="_blank" rel="noreferrer" className="truncate text-brand-700 hover:underline">
                      {v.caption || v.externalVideoUrl}
                    </a>
                    <form action={deletePortfolioItem.bind(null, v.id)}>
                      <button className="text-xs font-medium text-red-600 hover:underline">Eliminar</button>
                    </form>
                  </div>
                ))}
            </div>
            <form action={addPortfolioVideo} className="flex gap-2">
              <Input name="url" placeholder="https://…" className="flex-1" />
              <Button type="submit" variant="secondary">
                Añadir vídeo
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
