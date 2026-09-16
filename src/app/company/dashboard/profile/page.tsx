import Image from 'next/image';
import { DashboardShell, companyNavItems } from '@/components/dashboard-shell';
import { Card, Field, Input, Textarea, Button, LinkButton, Badge } from '@/components/ui/primitives';
import { requireCompanyProfile } from '@/lib/guards';
import { parseArray } from '@/lib/json';
import { VERIFICATION_STATUS_LABEL, type VerificationStatus } from '@/lib/constants';
import { addCompanyPhoto, removeCompanyPhoto, addCompanyVideo, removeCompanyVideo, submitCompanyVerification } from '@/actions/profile';
import { CompanyBasicInfoForm } from './basic-info-form';

export default async function CompanyProfilePage() {
  const { user, profile } = await requireCompanyProfile();
  const photos = parseArray<string>(profile.photos);
  const videos = parseArray<string>(profile.videos);

  return (
    <DashboardShell items={companyNavItems} activePath="/company/dashboard/profile" userName={user.name ?? ''} role={user.role}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Perfil de empresa</h1>
          <p className="text-sm text-ink-500">Así te ven los creadores.</p>
        </div>
        <LinkButton href={`/companies/${profile.slug}`} variant="secondary">
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
          <p className="text-sm text-ink-500">Tu empresa está verificada y muestra la insignia junto al nombre.</p>
        )}
        {profile.verificationStatus === 'PENDING' && (
          <p className="text-sm text-ink-500">Tu solicitud está en revisión. Te avisaremos en cuanto la resolvamos.</p>
        )}
        {(profile.verificationStatus === 'UNVERIFIED' || profile.verificationStatus === 'REJECTED') && (
          <form action={submitCompanyVerification} className="flex flex-col gap-3">
            <p className="text-sm text-ink-500">
              {profile.verificationStatus === 'REJECTED'
                ? 'Tu solicitud anterior fue rechazada. Puedes volver a enviarla.'
                : 'Indícanos tu CIF/NIF y comparte tu web, redes sociales u otra prueba de que el negocio es real, y lo revisaremos.'}
            </p>
            <Input name="taxId" defaultValue={profile.taxId ?? ''} placeholder="CIF / NIF" />
            <Textarea name="verificationNote" placeholder="Web, redes sociales u otra información que ayude a verificar el negocio" required />
            <Button type="submit" variant="secondary" className="self-start">
              Solicitar verificación
            </Button>
          </form>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold text-ink-900">Datos básicos</h2>
          <CompanyBasicInfoForm profile={profile} />
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-ink-900">Fotos del negocio</h2>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {photos.map((url) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-xl2 bg-ink-100">
                <Image src={url} alt="" fill className="object-cover" unoptimized />
                <form action={removeCompanyPhoto.bind(null, url)} className="absolute inset-x-0 bottom-0 bg-black/50 opacity-0 group-hover:opacity-100">
                  <button className="w-full py-1 text-xs font-medium text-white">Eliminar</button>
                </form>
              </div>
            ))}
          </div>
          <form action={addCompanyPhoto} className="mb-6 flex flex-col gap-2 rounded-xl2 border border-dashed border-ink-100 p-3">
            <Field label="Añadir foto">
              <input type="file" name="photo" accept="image/png,image/jpeg,image/webp" required className="text-sm" />
            </Field>
            <Button type="submit" variant="secondary">
              Subir foto
            </Button>
          </form>

          <h2 className="mb-3 font-semibold text-ink-900">Vídeos</h2>
          <div className="mb-3 flex flex-col gap-2">
            {videos.map((url) => (
              <div key={url} className="flex items-center justify-between rounded-xl2 border border-ink-100 px-3 py-2 text-sm">
                <a href={url} target="_blank" rel="noreferrer" className="truncate text-brand-700 hover:underline">
                  {url}
                </a>
                <form action={removeCompanyVideo.bind(null, url)}>
                  <button className="text-xs font-medium text-red-600 hover:underline">Eliminar</button>
                </form>
              </div>
            ))}
          </div>
          <form action={addCompanyVideo} className="flex gap-2">
            <Input name="url" placeholder="https://…" className="flex-1" />
            <Button type="submit" variant="secondary">
              Añadir
            </Button>
          </form>
        </Card>
      </div>
    </DashboardShell>
  );
}
