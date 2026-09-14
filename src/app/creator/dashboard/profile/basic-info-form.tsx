'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { updateCreatorBasicInfo } from '@/actions/profile';
import { Button, Field, Input, Textarea } from '@/components/ui/primitives';
import { ChipCheckbox } from '@/components/ui/chip-checkbox';
import { ImageFileInput } from '@/components/ui/file-input';
import { useToast } from '@/components/ui/toast';
import { CREATOR_CATEGORIES, LANGUAGES } from '@/lib/constants';
import type { creatorProfiles } from '@/db/schema';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Guardando…' : 'Guardar cambios'}
    </Button>
  );
}

export function CreatorBasicInfoForm({ profile }: { profile: typeof creatorProfiles.$inferSelect & { categoriesList: string[]; languagesList: string[]; brandsList: string[] } }) {
  const [state, formAction] = useFormState(updateCreatorBasicInfo, null);
  const { show } = useToast();

  useEffect(() => {
    if (state?.success) show('Perfil actualizado.');
    if (state?.error) show(state.error, 'error');
  }, [state, show]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <ImageFileInput name="avatar" label="Foto de perfil" round />
      <Field label="Nombre completo">
        <Input name="displayName" required defaultValue={profile.displayName} />
      </Field>
      <Field label="Ciudad">
        <Input name="city" defaultValue={profile.city ?? ''} />
      </Field>
      <Field label="Bio">
        <Textarea name="bio" defaultValue={profile.bio ?? ''} />
      </Field>
      <Field label="Categorías de contenido">
        <div className="flex flex-wrap gap-2">
          {CREATOR_CATEGORIES.map((c) => (
            <ChipCheckbox key={c} name="categories" value={c} defaultChecked={profile.categoriesList.includes(c)} />
          ))}
        </div>
      </Field>
      <Field label="Idiomas">
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <ChipCheckbox key={l} name="languages" value={l} defaultChecked={profile.languagesList.includes(l)} />
          ))}
        </div>
      </Field>
      <Field label="Marcas con las que has trabajado" hint="Sepáralas por comas.">
        <Input name="brandsWorkedWith" defaultValue={profile.brandsList.join(', ')} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Precio orientativo">
          <Input name="priceApprox" defaultValue={profile.priceApprox ?? ''} />
        </Field>
        <Field label="Disponibilidad">
          <Input name="availability" defaultValue={profile.availability ?? ''} />
        </Field>
      </div>
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
