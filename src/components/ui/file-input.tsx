'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

export function ImageFileInput({ name, label, round = false }: { name: string; label: string; round?: boolean }) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink-700">{label}</span>
      <div
        onClick={() => inputRef.current?.click()}
        className={`relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden border border-dashed border-ink-100 bg-ink-100/40 text-xs text-ink-300 hover:border-brand-300 ${
          round ? 'rounded-full' : 'rounded-xl2'
        }`}
      >
        {preview ? (
          <Image src={preview} alt="" fill className="object-cover" unoptimized />
        ) : (
          <span className="px-2 text-center">Subir foto</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setPreview(file ? URL.createObjectURL(file) : null);
        }}
      />
    </div>
  );
}
