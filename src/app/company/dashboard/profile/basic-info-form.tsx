'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { updateCompanyBasicInfo } from '@/actions/profile';
import { Button, Field, Input, Select, Textarea } from '@/components/ui/primitives';
import { ImageFileInput } from '@/components/ui/file-input';
import { useToast } from '@/components/ui/toast';
import { COMPANY_CATEGORIES } from '@/lib/constants';
import type { companyProfiles } from '@/db/schema';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Guardando…' : 'Guardar cambios'}
    </Button>
  );
}

export function CompanyBasicInfoForm({ profile }: { profile: typeof companyProfiles.$inferSelect }) {
  const [state, formAction] = useFormState(updateCompanyBasicInfo, null);
  const { show } = useToast();

  useEffect(() => {
    if (state?.success) show('Perfil actualizado.');
    if (state?.error) show(state.error, 'error');
  }, [state, show]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <ImageFileInput name="logo" label="Logo" round />
      <Field label="Nombre de la empresa">
        <Input name="name" required defaultValue={profile.name} />
      </Field>
      <Field label="Categoría">
        <Select name="category" defaultValue={profile.category}>
          {COMPANY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Ciudad">
        <Input name="city" defaultValue={profile.city ?? ''} />
      </Field>
      <Field label="Descripción">
        <Textarea name="description" defaultValue={profile.description ?? ''} />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Web">
          <Input name="website" defaultValue={profile.website ?? ''} />
        </Field>
        <Field label="Instagram">
          <Input name="instagram" defaultValue={profile.instagram ?? ''} />
        </Field>
        <Field label="TikTok">
          <Input name="tiktok" defaultValue={profile.tiktok ?? ''} />
        </Field>
      </div>
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
