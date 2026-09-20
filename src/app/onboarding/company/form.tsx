'use client';

import { useFormState } from 'react-dom';
import { completeCompanyOnboarding } from '@/actions/onboarding';
import { Stepper, Step } from '@/components/onboarding/stepper';
import { Field, Input, Textarea, Select } from '@/components/ui/primitives';
import { ImageFileInput } from '@/components/ui/file-input';
import { COMPANY_CATEGORIES } from '@/lib/constants';

export function CompanyOnboardingForm() {
  const [state, formAction] = useFormState(completeCompanyOnboarding, null);

  return (
    <form action={formAction}>
      <Stepper labels={['Datos básicos', 'Sobre el negocio', 'Fotos y vídeos']} submitLabel="Terminar y ver mi dashboard">
        <Step index={0}>
          <ImageFileInput name="logo" label="Logo" round />
          <Field label="Nombre de la empresa" required>
            <Input name="name" required placeholder="Bar El Rincón" />
          </Field>
          <Field label="Categoría" required>
            <Select name="category" required defaultValue="">
              <option value="" disabled>
                Elige una categoría
              </option>
              {COMPANY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Ciudad">
            <Input name="city" placeholder="Barcelona" />
          </Field>
        </Step>

        <Step index={1}>
          <Field label="Descripción">
            <Textarea name="description" placeholder="Cuéntanos qué hacéis y qué tipo de colaboraciones buscáis…" />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Página web">
              <Input name="website" placeholder="https://…" />
            </Field>
            <Field label="Instagram">
              <Input name="instagram" placeholder="@turestaurante" />
            </Field>
            <Field label="TikTok">
              <Input name="tiktok" placeholder="@turestaurante" />
            </Field>
          </div>
        </Step>

        <Step index={2}>
          <Field label="Fotos del negocio" hint="Hasta 6 fotos.">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <ImageFileInput key={i} name={`photo_${i}`} label={`Foto ${i + 1}`} />
              ))}
            </div>
          </Field>
          <Field label="Vídeos (enlace)" hint="Pega un enlace de YouTube, TikTok o Instagram.">
            <div className="flex flex-col gap-2">
              <Input name="video_url_0" placeholder="https://…" />
              <Input name="video_url_1" placeholder="https://…" />
            </div>
          </Field>
        </Step>
      </Stepper>

      {state?.error && <p className="mt-4 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
