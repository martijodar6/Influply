import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Influply — Marcas y creadores, conectados',
  description: 'Marketplace que conecta empresas y locales con influencers y creadores de contenido.'
};

// Loaded as a real <link> (browser-fetched) rather than next/font/google,
// which downloads at build time and has no offline/no-network fallback —
// the app still looks right even if this request is ever blocked, since
// globals.css's --font-sans stack falls back to the system UI font.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans text-ink-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
