import type { SocialPlatform } from '@/lib/constants';

// Small hand-drawn brand marks for each social platform — kept as inline SVG
// (no external icon package) so they render crisp at any size with zero
// extra requests, matching the style of the rest of the app (see
// components/logo.tsx).

function InstagramIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5.5" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
    </svg>
    );
}

function TikTokIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.6 2.8c.4 2.3 1.9 4 4.3 4.3v3.2c-1.6 0-3-.5-4.3-1.4v6.6c0 3.6-2.9 6.4-6.5 6.4S3.6 18.9 3.6 15.4c0-3.5 2.8-6.4 6.3-6.4.3 0 .6 0 1 .1v3.3a3 3 0 0 0-1-.2 3 3 0 1 0 0 6c1.7 0 3-1.3 3.1-2.9V2.8h3.6z" />
    </svg>
    );
}

function YoutubeIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2.3" y="5.5" width="19.4" height="13" rx="4" stroke="currentColor" strokeWidth="1.8" />
    <path d="M10.2 9.2 15.2 12l-5 2.8V9.2z" fill="currentColor" />
    </svg>
    );
}

function GenericLinkIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M9.5 14.5 14.5 9.5M11 7l1-1a3.5 3.5 0 0 1 5 5l-1 1M13 17l-1 1a3.5 3.5 0 0 1-5-5l1-1"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      />
    </svg>
    );
}

export function SocialPlatformIcon({ platform, size = 16 }: { platform: SocialPlatform; size?: number }) {
  switch (platform) {
    case 'INSTAGRAM':
      return <InstagramIcon size={size} />;
    case 'TIKTOK':
      return <TikTokIcon size={size} />;
    case 'YOUTUBE':
      return <YoutubeIcon size={size} />;
    default:
      return <GenericLinkIcon size={size} />;
  }
}
</svg>
