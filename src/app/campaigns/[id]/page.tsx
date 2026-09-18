import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { PublicNavbar } from '@/components/public-navbar';
import { Badge, Card, LinkButton } from '@/components/ui/primitives';
import { getCampaignDetail } from '@/lib/queries';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/db';
import { applications, creatorProfiles } from '@/db/schema';
import { CREATOR_TYPE_LABEL, COMPENSATION_TYPE_LABEL, CONTENT_TYPE_LABEL, APPLICATION_STATUS_LABEL, CAMPAIGN_REVIEW_STATUS_LABEL, type CampaignReviewStatus } from '@/lib/constants';
import { ApplyForm } from './apply-form';

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const [campaign, user] = await Promise.all([getCampaignDetail(params.id), getCurrentUser()]);
  if (!campaign) notFound();

  let existingApplicationStatus: string | null = null;
  let isOwner = false;
  if (user?.role === 'CREATOR') {
    const creator = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, user.id) });
    if (creator) {
      const app = await db.query.applications.findFirst({
        where: and(eq(applications.campaignId, campaign.id), eq(applications.creatorId, creator.id))
      });
      existingApplicationStatus = app?.status ?? null;
    }
  }
  if (user?.role === 'COMPANY') {
    isOwner = campaign.company.userId === user.id;
  }
  // A campaign pending/rejected review isn't public yet — only its owner and
  // admins (reviewing it from /admin/campaigns) can open it by direct link.
  if (campaign.reviewStatus !== 'APPROVED' && !isOwner && user?.role !== 'ADMIN') notFound();

  return (
    <div className="min-h-screen bg-[#faf9ff]">
      <PublicNavbar />
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        {isOwner && campaign.reviewStatus !== 'APPROVED' && (
          <div
            className={`mb-6 rounded-xl2 border p-4 text-sm ${
              campaign.reviewStatus === 'REJECTED' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
            {campaign.reviewStatus === 'REJECTED'
              ? 'Esta campaña no ha sido aprobada por el equipo de Influply, así que no es visible en el marketplace público.'
              : 'Esta campaña está en revisión por el equipo de Influply y aún no es visible en el marketplace público. Te avisaremos en cuanto se apruebe.'}
            {' Estado: '}
            <b>{CAMPAIGN_REVIEW_STATUS_LABEL[campaign.reviewStatus as CampaignReviewStatus] ?? 'En revisión'}</b>
          </div>
        )}
        <div className="relative mb-8 h-56 w-full overflow-hidden rounded-xl2 bg-gradient-to-br from-brand-100 to-accent-400/40 sm:h-72">
          {campaign.coverImageUrl && <Image src={campaign.coverImageUrl} alt={campaign.title} fill className="object-cover" unoptimized />}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink-500">
                {campaign.company.logoUrl && (
                  <Image src={campaign.company.logoUrl} alt="" width={22} height={22} className="rounded-full object-cover" unoptimized />
                )}
                <Link href={`/companies/${campaign.company.slug}`} className="hover:text-brand-700">
                  {campaign.company.name}
                </Link>
                <span>·</span>
                <span>{campaign.location}</span>
              </div>
              <h1 className="text-3xl font-bold text-ink-900">{campaign.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="brand">{campaign.category}</Badge>
                {campaign.creatorTypes.map((t) => (
                  <Badge key={t}>{CREATOR_TYPE_LABEL[t as keyof typeof CREATOR_TYPE_LABEL] ?? t}</Badge>
                ))}
              </div>
            </div>

            <Card>
              <h2 className="mb-2 font-semibold text-ink-900">Descripción</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{campaign.description}</p>
              {campaign.objective && (
                <>
                  <h3 className="mb-1 mt-4 text-sm font-semibold text-ink-900">Objetivo</h3>
                  <p className="text-sm text-ink-700">{campaign.objective}</p>
                </>
              )}
            </Card>

            <Card>
              <h2 className="mb-3 font-semibold text-ink-900">Requisitos</h2>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {campaign.requirements.minFollowers && (
                  <Info label="Seguidores mínimos" value={campaign.requirements.minFollowers.toLocaleString('es-ES')} />
                )}
                {campaign.requirements.ageRange && <Info label="Edad" value={campaign.requirements.ageRange} />}
                {campaign.requirements.mainPlatform && <Info label="Plataforma principal" value={campaign.requirements.mainPlatform} />}
                {campaign.requirements.audienceType && <Info label="Tipo de audiencia" value={campaign.requirements.audienceType} />}
                {campaign.requirements.contentCategory && <Info label="Categoría de contenido" value={campaign.requirements.contentCategory} />}
              </dl>
            </Card>

            <Card>
              <h2 className="mb-3 font-semibold text-ink-900">Contenido solicitado</h2>
              <ul className="flex flex-col gap-1.5 text-sm text-ink-700">
                {campaign.contentRequested.map((c, i) => (
                  <li key={i}>
                    {c.qty} × {CONTENT_TYPE_LABEL[c.type as keyof typeof CONTENT_TYPE_LABEL] ?? c.type}
                  </li>
                ))}
                {campaign.contentRequested.length === 0 && <li className="text-ink-400">Sin especificar.</li>}
              </ul>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <h2 className="mb-3 font-semibold text-ink-900">Qué recibe el creador</h2>
              <div className="flex flex-wrap gap-2">
                {campaign.compensationTypes.map((c) => (
                  <Badge key={c} tone="success">
                    {COMPENSATION_TYPE_LABEL[c as keyof typeof COMPENSATION_TYPE_LABEL] ?? c}
                  </Badge>
                ))}
              </div>
              {campaign.budgetApprox && <p className="mt-3 text-sm text-ink-700">Presupuesto orientativo: {campaign.budgetApprox}</p>}
              {campaign.applicationDeadline && (
                <p className="mt-1 text-xs text-ink-400">Fecha límite de aplicación: {new Date(campaign.applicationDeadline).toLocaleDateString('es-ES')}</p>
              )}
              <p className="mt-1 text-xs text-ink-400">{campaign.applicantCount} candidatos hasta ahora</p>
            </Card>

            <Card>
              {isOwner ? (
                <LinkButton href={`/company/dashboard/campaigns/${campaign.id}/applicants`} className="w-full">
                  Ver candidatos
                </LinkButton>
              ) : !user ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-ink-500">Inicia sesión como creador para aplicar a esta campaña.</p>
                  <LinkButton href="/signup?role=CREATOR" className="w-full">
                    Crear cuenta de creador
                  </LinkButton>
                </div>
              ) : user.role !== 'CREATOR' ? (
                <p className="text-sm text-ink-500">Solo los perfiles de creador pueden aplicar a campañas.</p>
              ) : existingApplicationStatus ? (
                <div className="rounded-xl2 border border-ink-100 bg-ink-100/40 p-4 text-sm text-ink-700">
                  Ya has aplicado a esta campaña. Estado:{' '}
                  <b>{APPLICATION_STATUS_LABEL[existingApplicationStatus as keyof typeof APPLICATION_STATUS_LABEL]}</b>
                </div>
              ) : (
                <ApplyForm campaignId={campaign.id} />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-400">{label}</dt>
      <dd className="font-medium text-ink-900">{value}</dd>
    </div>
  );
}
