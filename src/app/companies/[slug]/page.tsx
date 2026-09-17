import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicNavbar } from '@/components/public-navbar';
import { Badge, Button, Card } from '@/components/ui/primitives';
import { VerifiedBadge } from '@/components/verified-badge';
import { getCompanyDetailBySlug } from '@/lib/queries';
import { getCurrentUser } from '@/lib/session';
import { startConversationWithCompany } from '@/actions/messages';

export default async function CompanyProfilePage({ params }: { params: { slug: string } }) {
  const [company, user] = await Promise.all([getCompanyDetailBySlug(params.slug), getCurrentUser()]);
  if (!company) notFound();

  return (
    <div className="min-h-screen bg-[#faf9ff]">
      <PublicNavbar />
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="relative h-20 w-20 flex-none overflow-hidden rounded-2xl bg-ink-100 ring-4 ring-white">
            {company.logoUrl && <Image src={company.logoUrl} alt={company.name} fill className="object-cover" unoptimized />}
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-ink-900">
              {company.name}
              {company.verificationStatus === 'VERIFIED' && <VerifiedBadge size={18} />}
            </h1>
            <p className="text-sm text-ink-500">
              {company.category} {company.city ? `· ${company.city}` : ''}
            </p>
            <div className="mt-2 flex gap-3 text-sm text-brand-600">
              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer" className="hover:underline">
                  Web
                </a>
              )}
              {company.instagram && <span>{company.instagram}</span>}
              {company.tiktok && <span>{company.tiktok}</span>}
            </div>
          </div>
          {user?.role === 'CREATOR' && (
            <form action={startConversationWithCompany.bind(null, company.id)} className="ml-auto">
              <Button type="submit" variant="secondary">
                Enviar mensaje
              </Button>
            </form>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            {company.description && (
              <Card>
                <h2 className="mb-2 font-semibold text-ink-900">Sobre nosotros</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{company.description}</p>
              </Card>
            )}
            {company.photos.length > 0 && (
              <Card>
                <h2 className="mb-3 font-semibold text-ink-900">Fotos</h2>
                <div className="grid grid-cols-3 gap-3">
                  {company.photos.map((url, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-xl2 bg-ink-100">
                      <Image src={url} alt="" fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <h2 className="mb-3 font-semibold text-ink-900">Campañas activas</h2>
              {company.activeCampaigns.length === 0 ? (
                <p className="text-sm text-ink-400">Sin campañas activas ahora mismo.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {company.activeCampaigns.map((c) => (
                    <Link key={c.id} href={`/campaigns/${c.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                      {c.title}
                    </Link>
                  ))}
                </div>
              )}
            </Card>
            {company.pastCampaigns.length > 0 && (
              <Card>
                <h2 className="mb-3 font-semibold text-ink-900">Campañas anteriores</h2>
                <div className="flex flex-col gap-2">
                  {company.pastCampaigns.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-sm">
                      <span className="text-ink-700">{c.title}</span>
                      <Badge>Finalizada</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
