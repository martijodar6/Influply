// Central vocabulary for the string/JSON fields in src/db/schema.ts.
// Keeping these as plain arrays (rather than DB-level enums) is what lets
// the exact same schema run on SQLite now and Postgres later.

export const ROLES = ['CREATOR', 'COMPANY', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const CAMPAIGN_STATUS = ['DRAFT', 'ACTIVE', 'CLOSED'] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUS)[number];

export const APPLICATION_STATUS = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUS)[number];

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  COMPLETED: 'Completada'
};

export const PORTFOLIO_ITEM_TYPES = ['PHOTO', 'VIDEO'] as const;

export const SOCIAL_PLATFORMS = ['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'OTHER'] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_PLATFORM_LABEL: Record<SocialPlatform, string> = {
  INSTAGRAM: 'Instagram',
  TIKTOK: 'TikTok',
  YOUTUBE: 'YouTube',
  OTHER: 'Otra'
};

export const CREATOR_TYPES = [
  'MICROINFLUENCER',
  'INFLUENCER',
  'UGC_CREATOR',
  'PHOTOGRAPHER',
  'VIDEOGRAPHER',
  'TIKTOK_CREATOR',
  'INSTAGRAM_CREATOR',
  'LIFESTYLE_CREATOR'
] as const;
export type CreatorType = (typeof CREATOR_TYPES)[number];

export const CREATOR_TYPE_LABEL: Record<CreatorType, string> = {
  MICROINFLUENCER: 'Microinfluencer',
  INFLUENCER: 'Influencer',
  UGC_CREATOR: 'UGC Creator',
  PHOTOGRAPHER: 'Fotógrafo/a',
  VIDEOGRAPHER: 'Videógrafo/a',
  TIKTOK_CREATOR: 'TikTok Creator',
  INSTAGRAM_CREATOR: 'Instagram Creator',
  LIFESTYLE_CREATOR: 'Lifestyle Creator'
};

export const COMPENSATION_TYPES = [
  'PAID',
  'FREE_PRODUCT',
  'FREE_EXPERIENCE',
  'FOOD',
  'HOTEL',
  'EVENT',
  'EXCHANGE',
  'OTHER'
] as const;
export type CompensationType = (typeof COMPENSATION_TYPES)[number];

export const COMPENSATION_TYPE_LABEL: Record<CompensationType, string> = {
  PAID: 'Colaboración pagada',
  FREE_PRODUCT: 'Producto gratuito',
  FREE_EXPERIENCE: 'Experiencia gratuita',
  FOOD: 'Comida',
  HOTEL: 'Hotel',
  EVENT: 'Evento',
  EXCHANGE: 'Intercambio',
  OTHER: 'Otro'
};

export const CONTENT_TYPES = ['REEL', 'STORY', 'TIKTOK', 'PHOTO', 'UGC_VIDEO', 'POST', 'YOUTUBE_VIDEO'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  REEL: 'Reel',
  STORY: 'Story',
  TIKTOK: 'TikTok',
  PHOTO: 'Fotografía',
  UGC_VIDEO: 'Vídeo UGC',
  POST: 'Publicación',
  YOUTUBE_VIDEO: 'Vídeo de YouTube'
};

export const COMPANY_CATEGORIES = [
  'Restaurante',
  'Hotel',
  'Discoteca / Ocio nocturno',
  'Gimnasio',
  'Marca de ropa',
  'Ecommerce',
  'Centro de estética',
  'Clínica',
  'Eventos',
  'Marca de alimentación',
  'Turismo',
  'Otro'
] as const;

export const CREATOR_CATEGORIES = [
  'Gastronomía',
  'Moda',
  'Fitness',
  'Viajes',
  'Lifestyle',
  'Belleza',
  'Tecnología',
  'Hogar y decoración',
  'Familia',
  'Deportes',
  'Música',
  'Humor'
] as const;

export const LANGUAGES = ['Español', 'Catalán', 'Inglés', 'Francés', 'Portugués', 'Italiano', 'Alemán'] as const;

export const VERIFICATION_STATUS = ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUS)[number];

export const VERIFICATION_STATUS_LABEL: Record<VerificationStatus, string> = {
  UNVERIFIED: 'Sin verificar',
  PENDING: 'En revisión',
  VERIFIED: 'Verificado',
  REJECTED: 'Rechazado'
};

export const INVITATION_STATUS = ['PENDING', 'ACCEPTED', 'REJECTED'] as const;
export type InvitationStatus = (typeof INVITATION_STATUS)[number];

export const INVITATION_STATUS_LABEL: Record<InvitationStatus, string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada'
};

export const FAVORITE_TARGET_TYPES = ['CREATOR', 'CAMPAIGN'] as const;

export const AUDIENCE_TYPES = ['General', 'Familias', 'Jóvenes 18-25', 'Profesionales', 'Deportistas', 'Foodies'] as const;

export const MAIN_PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Blog', 'Indistinto'] as const;
