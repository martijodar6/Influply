import type { SocialPlatform } from './constants';

// Builds a direct, clickable profile URL from a platform + handle so a
// company can jump straight to a creator's social profile in one click.
// Handles are stored as plain usernames (with or without a leading "@"),
// but if a creator pasted a full link instead we just use it as-is.
export function getSocialProfileUrl(platform: SocialPlatform, handle: string): string | null {
  const trimmed = handle.trim();
  if (!trimmed) return null;

if (/^https?:\/\//i.test(trimmed)) return trimmed;

const clean = trimmed.replace(/^@+/, '');
  if (!clean) return null;

switch (platform) {
  case 'INSTAGRAM':
    return `https://instagram.com/${clean}`;
  case 'TIKTOK':
    return `https://www.tiktok.com/@${clean}`;
  case 'YOUTUBE':
    return `https://www.youtube.com/@${clean}`;
  default:
    return null;
}
}
