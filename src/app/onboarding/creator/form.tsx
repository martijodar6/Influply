'use client';

import { useFormState } from 'react-dom';
import { completeCreatorOnboarding } from '@/actions/onboarding';
import { Stepper, Step } from '@/components/onboarding/stepper';
import { Field, Input, Textarea, Select } from '@/components/ui/primitives';
import { ChipCheckbox } from '@/components/ui/chip-checkbox';
import { ImageFileInput } from '@/components/ui/file-input';
import { CREATOR_CATEGORIES, LANGUAGES, SOCIAL_PLATFORMS, SOCIAL_PLATFORM_LABEL } from '@/lib/constants';
import { VERIFICATION_CONTACT_HANDLE } from '@/lib/verification';

export function CreatorOnboardingForm({ verificationCode }: { verificationCode: string }) {
  const [state, formAction] = useFormState(completeCreatorOnboarding, null);

  return (
    <form action={formAction}>
      <Stepper
        labels={['Datos básicos', 'Sobre ti', 'Redes sociales', 'Portfolio', 'Verificación']}
        submitLabel="Terminar y ver mi dashboard"
      >
        <Step index={0}>
          <ImageFileInput name="avatar" label="Foto de perfil *" round />
          <Field label="Nombre completo" required>
            <Input name="displayName" required placeholder="Ana Pérez" />
          </Field>
          <Field label="Ciudad">
            <Input name="city" placeholder="Barcelona" />
          </Field>
        </Step>

        <Step index={1}>
          <Field label="Bio" required hint="Cuenta quién eres y qué tipo de contenido creas.">
            <Textarea name="bio" required placeholder="Creadora de contenido de viajes y lifestyle en Barcelona…" />
          </Field>
          <Field label="Categorías de contenido" required hint="Elige al menos una.">
            <div className="flex flex-wrap gap-2">
              {CREATOR_CATEGORIES.map((c) => (
                <ChipCheckbox key={c} name="categories" value={c} />
              ))}
            </div>
          </Field>
          <Field label="Idiomas">
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <ChipCheckbox key={l} name="languages" value={l} />
              ))}
            </div>
          </Field>
        </Step>

        <Step index={2}>
          <p className="text-sm text-ink-500">Añade al menos una red social con tu usuario (las demás filas puedes dejarlas vacías).</p>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-3 gap-3 rounded-xl2 border border-ink-100 p-3">
              <Select name={`social_platform_${i}`} defaultValue="">
                <option value="">Plataforma</option>
                {SOCIAL_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {SOCIAL_PLATFORM_LABEL[p]}
                  </option>
                ))}
              </Select>
              <Input name={`social_handle_${i}`} placeholder="@usuario" />
              <Input name={`social_followers_${i}`} type="number" min={0} placeholder="Seguidores" />
            </div>
          ))}
        </Step>

        <Step index={3}>
          <Field label="Fotos del portfolio" hint="Sube tus mejores piezas (hasta 6).">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <ImageFileInput key={i} name={`portfolio_photo_${i}`} label={`Foto ${i + 1}`} />
              ))}
            </div>
          </Field>
          <Field label="Vídeos (enlace)" hint="Pega un enlace de YouTube, TikTok o Vimeo.">
            <div className="flex flex-col gap-2">
              <Input name="portfolio_video_url_0" placeholder="https://…" />
              <Input name="portfolio_video_url_1" placeholder="https://…" />
            </div>
          </Field>
          <Field label="Marcas con las que has trabajado" hint="Sepáralas por comas.">
            <Input name="brandsWorkedWith" placeholder="Nike, Zara, Café Nòmada…" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Precio orientativo (opcional)">
              <Input name="priceApprox" placeholder="p.ej. desde 150€ / colaboración" />
            </Field>
            <Field label="Disponibilidad">
              <Input name="availability" placeholder="p.ej. Disponible este mes" />
            </Field>
          </div>
        </Step>

        <Step index={4}>
          <p className="text-sm text-ink-500">
            Verificar tu cuenta ahora es opcional — los perfiles verificados generan más confianza, pero puedes dejarlo para
            más tarde desde tu perfil si prefieres terminar rápido.
          </p>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink-600">
            <li>
              Envía este código por mensaje directo (o coméntalo en nuestra última publicación) desde tu cuenta de Instagram o
              TikTok a <b>{VERIFICATION_CONTACT_HANDLE}</b>:{' '}
              <span className="rounded bg-brand-50 px-2 py-0.5 font-mono font-bold tracking-wider text-brand-700">
                {verificationCode}
              </span>
            </li>
            <li>Hazte una selfie sujetando ese código (escrito a mano o en la pantalla del móvil) y súbela abajo.</li>
          </ol>
          <input type="hidden" name="verificationCode" value={verificationCode} />
          <Field label="Selfie con el código (opcional)">
            <input type="file" name="verificationSelfie" accept="image/png,image/jpeg,image/webp" className="text-sm" />
          </Field>
        </Step>
      </Stepper>

      {state?.error && <p className="mt-4 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
