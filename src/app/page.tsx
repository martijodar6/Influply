import { PublicNavbar } from '@/components/public-navbar';
import { LinkButton, Card } from '@/components/ui/primitives';
import { LogoMark } from '@/components/logo';

export default function HomePage() {
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
        <div className="grid gap-8 sm:grid-cols-3">
          <HowStep n="1" title="Crea tu perfil" description="Empresas y creadores completan un perfil en minutos: sin formularios interminables." icon={<ProfileIcon />} />
          <HowStep n="2" title="Publica o descubre" description="Las empresas publican campañas; los creadores las descubren, las filtran y aplican." icon={<BroadcastIcon />} />
          <HowStep n="3" title="Colaborad" description="Acepta candidaturas, coordina la colaboración y haz crecer tu marca o tu comunidad." icon={<LinkIcon />} />
        </div>
      </section>

      {/* Cuánto tiempo ahorra */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-ink-900">Todo lo que ya no tienes que hacer a mano</h2>
          <p className="mt-3 text-ink-500">
            Buscar creadores uno a uno, negociar por mensajes privados y perder el hilo en capturas de pantalla se lleva horas. Influply lo
            reduce a minutos.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Card className="p-8">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-ink-500">Sin Influply</h3>
            <ul className="flex flex-col gap-3 text-sm text-ink-600">
              <ComparisonItem tone="bad" text="Buscar perfiles afines uno a uno en redes sociales." />
              <ComparisonItem tone="bad" text="Negociar por mensaje privado, sin un lugar centralizado." />
              <ComparisonItem tone="bad" text="Perder candidaturas y contactos entre chats y capturas de pantalla." />
              <ComparisonItem tone="bad" text="Semanas de idas y vueltas para cerrar una sola colaboración." />
            </ul>
          </Card>
          <Card className="border-brand-100 bg-white p-8 ring-1 ring-brand-100">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-600">Con Influply</h3>
            <ul className="flex flex-col gap-3 text-sm text-ink-600">
              <ComparisonItem tone="good" text="Publica tu campaña una vez y recibe candidaturas cualificadas." />
              <ComparisonItem tone="good" text="Filtra creadores por categoría, zona y seguidores en segundos." />
              <ComparisonItem tone="good" text="Gestiona candidatos, favoritos y colaboraciones desde un único panel." />
              <ComparisonItem tone="good" text="De publicar la campaña a la primera respuesta, en minutos." />
            </ul>
          </Card>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-xl2 border border-ink-100 bg-white px-8 py-10 text-center shadow-soft sm:flex-row sm:gap-8 sm:text-left">
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="text-4xl font-bold text-ink-300 sm:text-5xl">10h</span>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none text-brand-500">
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
            <span className="text-4xl font-bold text-brand-600 sm:text-5xl">1h</span>
          </div>
          <p className="max-w-xs text-sm text-ink-500">
            Es lo que puede llevar hoy buscar y negociar una colaboración a mano, frente a lo que tarda publicar una campaña en Influply.
          </p>
        </div>
      </section>

      {/* Punto de encuentro */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-ink-900">Influply, el punto de encuentro</h2>
          <p className="mt-3 text-ink-500">
            Un único espacio donde marcas, negocios y creadores se descubren y colaboran, sin pasar por decenas de perfiles, DMs y hojas de
            cálculo distintas.
          </p>
        </div>

        <div className="relative mt-12 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-0">
          <MeetingCard
            title="Marcas y negocios"
            description="Publican lo que necesitan y descubren creadores listos para colaborar, sin buscar a ciegas."
            icon={<StorefrontIcon />}
          />
          <div className="z-10 mx-auto -my-3 flex h-16 w-16 flex-none items-center justify-center rounded-full bg-white shadow-soft sm:-mx-6 sm:my-0">
            <LogoMark size={32} />
          </div>
          <MeetingCard
            title="Creadores"
            description="Encuentran campañas reales, aplican en un clic y construyen su portfolio con marcas de verdad."
            icon={<SparkIcon />}
          />
        </div>
      </section>

      {/* Por qué importa ahora */}
      <section className="px-5 sm:px-8">
        <div className="mx-auto max-w-5xl rounded-xl2 bg-gradient-to-br from-brand-600 to-accent-500 px-8 py-12 text-center text-white shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Por qué importa ahora</p>
          <p className="mt-4 text-4xl font-bold sm:text-5xl">$40.510M</p>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-white/90">
            Es el tamaño estimado del mercado global de influencer marketing en 2026 — y el 74% de las marcas ya planea aumentar su
            inversión en creadores este año. Conectar con la persona adecuada ya no es opcional: es donde está pasando el marketing.
          </p>
          <p className="mt-5 text-xs text-white/60">Fuentes: Mordor Intelligence · Aspire, 2026 State of Influencer Marketing Report</p>
        </div>
      </section>

      {/* Para quién está pensado */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-ink-900">Pensado para cada tipo de colaboración</h2>
          <p className="mt-3 text-ink-500">Da igual si acabas de empezar o llevas años: hay un sitio para ti en Influply.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <AudienceCard
            tone="brand"
            title="Negocios locales"
            description="Restaurantes, gimnasios y tiendas que quieren visibilidad real en su zona sin pasar por una agencia."
            icon={<StorefrontIcon />}
          />
          <AudienceCard
            tone="accent"
            title="Marcas y empresas"
            description="Equipos que necesitan lanzar campañas con creadores afines a su marca, de forma recurrente."
            icon={<BroadcastIcon />}
          />
          <AudienceCard
            tone="accent"
            title="Creadores que empiezan"
            description="Micro-creadores que buscan sus primeras colaboraciones y quieren construir un portfolio real."
            icon={<SparkIcon />}
          />
          <AudienceCard
            tone="brand"
            title="Creadores establecidos"
            description="Creadores con comunidad que quieren gestionar sus colaboraciones de forma profesional, en un solo lugar."
            icon={<LinkIcon />}
          />
        </div>
      </section>

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

function HowStep({ n, title, description, icon }: { n: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-accent-400/20 text-brand-600">
        {icon}
        <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
          {n}
        </div>
      </div>
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

function ComparisonItem({ text, tone }: { text: string; tone: 'good' | 'bad' }) {
  return (
    <li className="flex items-start gap-2.5">
      {tone === 'good' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 flex-none text-brand-500">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 flex-none text-ink-300">
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      )}
      {text}
    </li>
  );
}

function MeetingCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <Card className="flex-1 p-8 text-center sm:text-left">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 sm:mx-0">{icon}</div>
      <h3 className="mt-4 text-lg font-bold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm text-ink-500">{description}</p>
    </Card>
  );
}

function AudienceCard({
  title,
  description,
  icon,
  tone
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  tone: 'brand' | 'accent';
}) {
  const iconClasses = tone === 'brand' ? 'bg-brand-50 text-brand-600' : 'bg-accent-400/20 text-accent-500';
  return (
    <Card className="p-6">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClasses}`}>{icon}</div>
      <h3 className="mt-4 font-bold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm text-ink-500">{description}</p>
    </Card>
  );
}

function ProfileIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="12" cy="10" r="2.5" />
      <path d="M7 16.5c1-2.2 2.8-3 5-3s4 0.8 5 3" />
    </svg>
  );
}

function BroadcastIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10.5v3a1 1 0 001 1h1.8l4.7 3V6.5l-4.7 3H5a1 1 0 00-1 1z" />
      <path d="M15.5 9a3.2 3.2 0 010 6" />
      <path d="M18 6.8a6.4 6.4 0 010 10.4" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 14.5l5-5" />
      <path d="M11 7l0.7-0.7a3.7 3.7 0 015.3 5.3l-0.7 0.7" />
      <path d="M13 17l-0.7 0.7a3.7 3.7 0 01-5.3-5.3l0.7-0.7" />
    </svg>
  );
}

function StorefrontIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5l1-4.5h14l1 4.5" />
      <path d="M4 9.5a2.2 2.2 0 004.4 0 2.2 2.2 0 004.4 0 2.2 2.2 0 004.4 0 2.2 2.2 0 004.4 0" />
      <path d="M5 10v8.5a1 1 0 001 1h12a1 1 0 001-1V10" />
      <path d="M10 19.5V15a1 1 0 011-1h2a1 1 0 011 1v4.5" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5l1.8 5.1 5.2 1.9-5.2 1.9-1.8 5.1-1.8-5.1-5.2-1.9 5.2-1.9z" />
      <path d="M19 16.5l0.7 1.9 1.9 0.7-1.9 0.7-0.7 1.9-0.7-1.9-1.9-0.7 1.9-0.7z" />
    </svg>
  );
}
