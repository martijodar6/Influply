'use client';

import { useFormState } from 'react-dom';
import { createCampaign } from '@/actions/campaigns';
import { Stepper, Step } from '@/components/onboarding/stepper';
import { Field, Input, Textarea, Select } from '@/components/ui/primitives';
import { ChipCheckbox } from '@/components/ui/chip-checkbox';
import { ImageFileInput } from '@/components/ui/file-input';
import {
  CREATOR_CATEGORIES,
  CREATOR_TYPES,
  CREATOR_TYPE_LABEL,
  COMPENSATION_TYPES,
  COMPENSATION_TYPE_LABEL,
  CONTENT_TYPES,
  CONTENT_TYPE_LABEL,
  AUDIENCE_TYPES,
  MAIN_PLATFORMS
} from '@/lib/constants';

const LOCATIONS = ['Barcelona', 'Madrid', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga'];

export function NewCampaignForm() {
  const [state, formAction] = useFormState(createCampaign, null);

  return (
    <form action={formAction}>
      <Stepper labels={['Información básica', 'Tipo de creador', 'Qué ofrece', 'Contenido']} submitLabel="Publicar campaña">
        <Step index={0}>
          <ImageFileInput name="coverImage" label="Imagen de la campaña" />
          <Field label="Nombre de campaña">
            <Input name="title" required placeholder="Lanzamiento carta de otoño" />
          </Field>
          <Field label="Descripción">
            <Textarea name="description" required placeholder="Describe la colaboración…" />
          </Field>
          <Field label="Objetivo de la campaña">
            <Input name="objective" placeholder="p.ej. Dar a conocer la nueva carta entre público local" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoría">
              <Select name="category" required defaultValue="">
                <option value="" disabled>
                  Elige una categoría
                </option>
                {CREATOR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Ubicación">
              <Select name="location" required defaultValue="">
                <option value="" disabled>
                  Elige una ubicación
                </option>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha de la campaña">
              <Input type="date" name="startDate" />
            </Field>
            <Field label="Fecha límite de aplicación">
              <Input type="date" name="applicationDeadline" />
            </Field>
          </div>
        </Step>

        <Step index={1}>
          <Field label="Tipo de creador buscado">
            <div className="flex flex-wrap gap-2">
              {CREATOR_TYPES.map((t) => (
                <ChipCheckbox key={t} name="creatorTypes" value={t} label={CREATOR_TYPE_LABEL[t]} />
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Seguidores mínimos">
              <Input type="number" name="minFollowers" min={0} placeholder="5000" />
            </Field>
            <Field label="Rango de edad">
              <Input name="ageRange" placeholder="p.ej. 20-35" />
            </Field>
            <Field label="Plataforma principal">
              <Select name="mainPlatform" defaultValue="">
                <option value="">Indistinto</option>
                {MAIN_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tipo de audiencia">
              <Select name="audienceType" defaultValue="">
                <option value="">Indistinto</option>
                {AUDIENCE_TYPES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Categoría de contenido esperada">
            <Input name="contentCategory" placeholder="p.ej. Gastronomía, lifestyle…" />
          </Field>
        </Step>

        <Step index={2}>
          <Field label="Qué ofrece la empresa" required hint="Elige al menos una.">
            <div className="flex flex-wrap gap-2">
              {COMPENSATION_TYPES.map((c) => (
                <ChipCheckbox key={c} name="compensationTypes" value={c} label={COMPENSATION_TYPE_LABEL[c]} />
              ))}
            </div>
          </Field>
          <Field label="Presupuesto aproximado" required hint="Obligatorio si ofreces una colaboración pagada.">
            <Input name="budgetApprox" placeholder="p.ej. 150-250€" />
          </Field>
        </Step>

        <Step index={3}>
          <p className="text-sm text-ink-500">
            Indica al menos un tipo de contenido que esperas recibir, con cantidad (deja en blanco lo que no aplique).
          </p>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="grid grid-cols-[1fr_100px] gap-3">
              <Select name={`content_type_${i}`} defaultValue="">
                <option value="">Tipo de contenido</option>
                {CONTENT_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {CONTENT_TYPE_LABEL[c]}
                  </option>
                ))}
              </Select>
              <Input name={`content_qty_${i}`} type="number" min={0} placeholder="Cantidad" />
            </div>
          ))}
        </Step>
      </Stepper>

      {state?.error && <p className="mt-4 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
