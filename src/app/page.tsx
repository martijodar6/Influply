import Link from 'next/link';
import { PublicNavbar } from '@/components/public-navbar';
import { CampaignCard } from '@/components/campaign-card';
import { CreatorCard } from '@/components/creator-card';
import { LinkButton, Card } from '@/components/ui/primitives';
import { listActiveCampaignCards, listCreatorCards } from '@/lib/queries';
import { LogoMark } from '@/components/logo';

export default async function HomePage() {
  const [campaigns, creators] = await Promise.all([listActiveCampaignCards().catch(() => []), listCreatorCards().catch(() => [])]);
  return (
    <div className="min-h-screen bg-[#faf9ff]">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
        <div className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-accent-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 top-32 h-56 w-56 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <LogoMark size={44} />
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink-900 sm:text-5xl">Marcas y creadores, conectados.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-500">
            Encuentra colaboraciones, descubre talento y crea campañas sin intermediarios.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/signup?role=COMPANY" className="w-full px-7 py-3 text-base sm:w-auto">
              Soy una empresa
            </LinkButton>
            <LinkButton href="/signup?role=CREATOR" variant="secondary" className="w-full px-7 py-3 text-base sm:w-auto">
              Soy creador
            </LinkButton>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <h2 className="mb-10 text-center text-2xl font-bold text-ink-900">Cómo funciona</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <HowStep n="1" title="Crea tu perfil" description="Empresas y creadores completan un perfil en minutos: sin formularios interminables." />
          <HowStep n="2" title="Publica o descubre" description="Las empresas publican campañas; los creadores las descubren, las filtran y aplican." />
          <HowStep n="3" title="Colaborad" description="Acepta candidaturas, coordina la colaboración y haz crecer tu marca o tu comunidad." />
        </div>
      </section>

      {/* Campañas destacadas */}
      {campaigns.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-ink-900">Campañas destacadas</h2>
            <Link href="/campaigns" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              Ver todas →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {campaigns.slice(0, 3).map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </section>
      )}

      {/* Creadores destacados */}
      {creators.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-ink-900">Creadores destacados</h2>
            <Link href="/creators" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              Ver todos →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {creators.slice(0, 3).map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
        </section>
      )}

      {/* Ventajas */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="p-8">
            <h3 className="mb-4 text-lg font-bold text-ink-900">Para marcas y negocios</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-ink-600">
              <Advantage text="Publica campañas en minutos y recibe candidaturas cualificadas." />
              <Advantage text="Filtra y descubre creadores por zona, categoría y seguidores." />
              <Advantage text="Gestiona candidatos, favoritos y colaboraciones desde un solo panel." />
            </ul>
          </Card>
          <Card className="p-8">
            <h3 className="mb-4 text-lg font-bold text-ink-900">Para creadores</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-ink-600">
              <Advantage text="Un portfolio visual que muestra tu mejor trabajo a marcas reales." />
              <Advantage text="Descubre campañas filtradas por tu categoría y ubicación." />
              <Advantage text="Sigue el estado de tus candidaturas en un solo lugar." />
            </ul>
          </Card>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 rounded-xl2 bg-ink-900 px-8 py-14 text-center text-white">
          <h2 className="text-2xl font-bold sm:text-3xl">Empieza gratis hoy</h2>
          <p className="max-w-md text-white/70">Únete a Influply y conecta con las marcas o los creadores que estabas buscando.</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/signup?role=COMPANY" className="px-7 py-3 text-base">
              Soy una empresa
            </LinkButton>
            <LinkButton href="/signup?role=CREATOR" variant="secondary" className="bg-white/10 px-7 py-3 text-base text-white hover:bg-white/20">
              Soy creador
            </LinkButton>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-100 px-5 py-8 text-center text-xs text-ink-300 sm:px-8">Influply · MVP</footer>
    </div>
  );
}

function HowStep({ n, title, description }: { n: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">{n}</div>
      <h3 className="font-semibold text-ink-900">{title}</h3>
      <p className="text-sm text-ink-500">{description}</p>
    </div>
  );
}

function Advantage({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 flex-none text-brand-500">
        <path d="M20 6L9 17l-5-5" />
      </svg>
      {text}
    </li>
  );
}
