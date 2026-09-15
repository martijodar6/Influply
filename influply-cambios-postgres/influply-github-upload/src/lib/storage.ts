// Media storage abstraction.
//
// `saveUpload` is the one function the rest of the app calls to persist an
// uploaded file and get back a public URL. Two drivers:
//  - "local": writes into /public/uploads with sharp-optimized images.
//    Only useful for local dev — Vercel's serverless filesystem is
//    ephemeral/read-only, so uploads never survive a redeploy there.
//  - "vercel-blob": uploads to Vercel Blob storage (public access), which
//    is what production uses. Switch via the STORAGE_DRIVER env var.
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { put } from '@vercel/blob';

export type UploadKind = 'avatar' | 'logo' | 'portfolio-photo' | 'campaign-cover' | 'business-photo' | 'cover-photo';

const IMAGE_KINDS: UploadKind[] = ['avatar', 'logo', 'portfolio-photo', 'campaign-cover', 'business-photo', 'cover-photo'];

const MAX_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4']);

export class UploadError extends Error {}

export async function saveUpload(file: File, kind: UploadKind): Promise<string> {
  if (file.size === 0) throw new UploadError('El archivo está vacío.');
  if (file.size > MAX_BYTES) throw new UploadError('El archivo supera el tamaño máximo (15MB).');

  const isImage = ALLOWED_IMAGE_TYPES.has(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.has(file.type);
  if (!isImage && !isVideo) {
    throw new UploadError('Formato no admitido. Usa JPG, PNG, WEBP o MP4.');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const id = randomUUID();
  const driver = process.env.STORAGE_DRIVER || 'local';

  if (isImage && IMAGE_KINDS.includes(kind)) {
    const filename = `${id}.webp`;
    const maxDimension = kind === 'avatar' || kind === 'logo' ? 512 : kind === 'cover-photo' ? 1920 : 1600;
    const optimized = await sharp(buffer)
      .rotate()
      .resize({ width: maxDimension, height: maxDimension, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    if (driver === 'vercel-blob') {
      const blob = await put(`${kind}/${filename}`, optimized, { access: 'public', contentType: 'image/webp' });
      return blob.url;
    }
    return saveLocal(optimized, kind, filename);
  }

  const ext = file.type === 'video/mp4' ? 'mp4' : 'bin';
  const filename = `${id}.${ext}`;

  if (driver === 'vercel-blob') {
    const blob = await put(`${kind}/${filename}`, buffer, { access: 'public', contentType: file.type || 'application/octet-stream' });
    return blob.url;
  }
  return saveLocal(buffer, kind, filename);
}

async function saveLocal(buffer: Buffer, kind: UploadKind, filename: string): Promise<string> {
  const dir = path.join(process.cwd(), 'public', 'uploads', kind);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${kind}/${filename}`;
}
