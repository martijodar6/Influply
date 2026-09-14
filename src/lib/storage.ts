// Media storage abstraction.
//
// `saveUpload` is the one function the rest of the app calls to persist an
// uploaded file and get back a public URL. Today it has one driver
// ("local", writing into /public/uploads with sharp-optimized images) —
// switching STORAGE_DRIVER to "s3" and filling in the implementation below
// is the whole migration needed to move to real cloud storage later
// (see README.md "Media storage"). Nothing above this file needs to change.
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export type UploadKind = 'avatar' | 'logo' | 'portfolio-photo' | 'campaign-cover' | 'business-photo';

const IMAGE_KINDS: UploadKind[] = ['avatar', 'logo', 'portfolio-photo', 'campaign-cover', 'business-photo'];

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

  const driver = process.env.STORAGE_DRIVER || 'local';
  if (driver !== 'local') {
    // Wire your S3-compatible driver here (see README.md). Kept as an
    // explicit error rather than silently falling back to local disk,
    // since local writes don't persist on serverless platforms.
    throw new UploadError(
      `STORAGE_DRIVER="${driver}" no está implementado todavía. Implementa la subida a bucket en src/lib/storage.ts.`
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const id = randomUUID();
  const dir = path.join(process.cwd(), 'public', 'uploads', kind);
  await mkdir(dir, { recursive: true });

  if (isImage && IMAGE_KINDS.includes(kind)) {
    const filename = `${id}.webp`;
    const maxDimension = kind === 'avatar' || kind === 'logo' ? 512 : 1600;
    const optimized = await sharp(buffer)
      .rotate()
      .resize({ width: maxDimension, height: maxDimension, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    await writeFile(path.join(dir, filename), optimized);
    return `/uploads/${kind}/${filename}`;
  }

  const ext = file.type === 'video/mp4' ? 'mp4' : 'bin';
  const filename = `${id}.${ext}`;
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${kind}/${filename}`;
}
