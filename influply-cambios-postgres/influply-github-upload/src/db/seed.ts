// Demo/seed data for local development and for reviewers to click through
// the two core flows without registering accounts by hand.
//
// Run with: npm run seed
// (safe to re-run: it wipes and re-inserts all tables first)
//
// All demo accounts share the password: Demo1234!
import 'dotenv/config';
import { randomUUID } from 'crypto';
import slugify from 'slugify';
import { db } from './index';
import {
  users,
  creatorProfiles,
  socialNetworks,
  portfolioItems,
  companyProfiles,
  campaigns,
  applications,
  favorites,
  notifications,
  passwordResetTokens
} from './schema';
import { hashPassword } from '../lib/password';
import { toJsonArray, toJsonObject } from '../lib/json';

const DEMO_PASSWORD = 'Demo1234!';

// Deterministic placeholder images (picsum.photos seeded URLs — stable per seed string).
const avatar = (seed: string) => `https://picsum.photos/seed/${seed}/300/300`;
const wide = (seed: string) => `https://picsum.photos/seed/${seed}/900/600`;

async function main() {
  console.log('Wiping existing data…');
  await db.delete(notifications);
  await db.delete(favorites);
  await db.delete(applications);
  await db.delete(campaigns);
  await db.delete(portfolioItems);
  await db.delete(socialNetworks);
  await db.delete(creatorProfiles);
  await db.delete(companyProfiles);
  await db.delete(passwordResetTokens);
  await db.delete(users);

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  // ---------------------------------------------------------------------
  // Companies
  // ---------------------------------------------------------------------
  type CompanySeed = {
    name: string;
    category: string;
    city: string;
    description: string;
    website: string;
    instagram: string;
    tiktok?: string;
    photos: string[];
  };

  const companySeeds: CompanySeed[] = [
    {
      name: 'Café Lúmina',
      category: 'Restaurante',
      city: 'Madrid',
      description:
        'Cafetería de especialidad en el barrio de Malasaña. Café de tueste propio, brunch de fin de semana y una carta que cambia cada temporada.',
      website: 'https://cafelumina.example.com',
      instagram: '@cafelumina',
      tiktok: '@cafelumina',
      photos: [wide('cafelumina-1'), wide('cafelumina-2'), wide('cafelumina-3')]
    },
    {
      name: 'Hotel Marisol',
      category: 'Hotel',
      city: 'Málaga',
      description:
        'Hotel boutique frente al mar con piscina infinita, spa y restaurante propio. Especializado en escapadas de fin de semana.',
      website: 'https://hotelmarisol.example.com',
      instagram: '@hotelmarisol',
      photos: [wide('marisol-1'), wide('marisol-2'), wide('marisol-3'), wide('marisol-4')]
    },
    {
      name: 'FitZone Gym',
      category: 'Gimnasio',
      city: 'Barcelona',
      description:
        'Centro deportivo con clases dirigidas, entrenamiento funcional y personal trainers. Comunidad activa de más de 2000 socios.',
      website: 'https://fitzonegym.example.com',
      instagram: '@fitzonegym',
      tiktok: '@fitzonegym',
      photos: [wide('fitzone-1'), wide('fitzone-2')]
    },
    {
      name: 'Nómada Ropa',
      category: 'Marca de ropa',
      city: 'Valencia',
      description:
        'Marca de moda sostenible hecha en España. Prendas atemporales pensadas para viajar ligero. Producción local y tejidos naturales.',
      website: 'https://nomadaropa.example.com',
      instagram: '@nomada.ropa',
      tiktok: '@nomada.ropa',
      photos: [wide('nomada-1'), wide('nomada-2'), wide('nomada-3')]
    },
    {
      name: 'Pura Estética',
      category: 'Centro de estética',
      city: 'Sevilla',
      description:
        'Centro de belleza y bienestar especializado en tratamientos faciales y corporales con tecnología de última generación.',
      website: 'https://puraestetica.example.com',
      instagram: '@puraestetica',
      photos: [wide('pura-1'), wide('pura-2')]
    }
  ];

  const companyIds: Record<string, string> = {};

  for (const c of companySeeds) {
    const email = `${slugify(c.name, { lower: true, strict: true })}@influply.com`;
    const userId = randomUUID();
    await db.insert(users).values({ id: userId, email, passwordHash, role: 'COMPANY', name: c.name });

    const companyId = randomUUID();
    await db.insert(companyProfiles).values({
      id: companyId,
      userId,
      name: c.name,
      slug: slugify(c.name, { lower: true, strict: true }),
      logoUrl: avatar(`${slugify(c.name, { lower: true, strict: true })}-logo`),
      category: c.category,
      city: c.city,
      description: c.description,
      website: c.website,
      instagram: c.instagram,
      tiktok: c.tiktok ?? null,
      photos: toJsonArray(c.photos),
      videos: toJsonArray([]),
      onboardingDone: true
    });
    companyIds[c.name] = companyId;
    console.log(`Empresa creada: ${c.name} (${email})`);
  }

  // ---------------------------------------------------------------------
  // Creators
  // ---------------------------------------------------------------------
  type CreatorSeed = {
    displayName: string;
    city: string;
    categories: string[];
    languages: string[];
    bio: string;
    brands: string[];
    price: string;
    availability: string;
    socials: { platform: 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE'; handle: string; followers: number; engagementRate: number }[];
  };

  const creatorSeeds: CreatorSeed[] = [
    {
      displayName: 'Laura Gómez',
      city: 'Madrid',
      categories: ['Gastronomía', 'Lifestyle'],
      languages: ['Español', 'Inglés'],
      bio: 'Foodie profesional. Reseño restaurantes y cafeterías por Madrid con fotografía y reels de comida.',
      brands: ['Café Lúmina', 'Vinoteca Rioja', 'Panadería Sol'],
      price: '150-300€ por colaboración',
      availability: 'Disponible entre semana',
      socials: [
        { platform: 'INSTAGRAM', handle: '@laura.gomez', followers: 45000, engagementRate: 4.2 },
        { platform: 'TIKTOK', handle: '@lauragomezfood', followers: 12000, engagementRate: 6.1 }
      ]
    },
    {
      displayName: 'Marc Puig',
      city: 'Barcelona',
      categories: ['Fitness', 'Deportes'],
      languages: ['Español', 'Catalán', 'Inglés'],
      bio: 'Entrenador personal y creador de contenido fitness. Rutinas, retos de 30 días y nutrición deportiva.',
      brands: ['FitZone Gym', 'ProteinLab'],
      price: '200-500€ por colaboración',
      availability: 'Fines de semana',
      socials: [{ platform: 'INSTAGRAM', handle: '@marc.puig.fit', followers: 80000, engagementRate: 3.5 }]
    },
    {
      displayName: 'Aitana Ruiz',
      city: 'Valencia',
      categories: ['Moda', 'Lifestyle'],
      languages: ['Español', 'Inglés'],
      bio: 'Creadora de moda y estilismo. Trabajo con marcas de ropa sostenible y ecommerce de accesorios.',
      brands: ['Nómada Ropa', 'Zapatería Luna', 'Bisutería Nube'],
      price: 'Desde 400€',
      availability: 'Disponible todo el mes',
      socials: [
        { platform: 'INSTAGRAM', handle: '@aitanaruiz', followers: 150000, engagementRate: 2.8 },
        { platform: 'TIKTOK', handle: '@aitana.ruiz', followers: 200000, engagementRate: 5.4 }
      ]
    },
    {
      displayName: 'Diego Fernández',
      city: 'Málaga',
      categories: ['Viajes', 'Lifestyle'],
      languages: ['Español', 'Inglés', 'Francés'],
      bio: 'Viajero y fotógrafo. Colaboro con hoteles y destinos turísticos creando contenido visual y reseñas honestas.',
      brands: ['Hotel Marisol', 'Turismo Costa del Sol'],
      price: 'A negociar / intercambio en estancias',
      availability: 'Flexible, viaja habitualmente',
      socials: [{ platform: 'INSTAGRAM', handle: '@diego.viaja', followers: 30000, engagementRate: 4.0 }]
    },
    {
      displayName: 'Sofía Navarro',
      city: 'Sevilla',
      categories: ['Lifestyle', 'Belleza'],
      languages: ['Español'],
      bio: 'Contenido de día a día, rutinas de belleza y recomendaciones de centros de estética y bienestar.',
      brands: ['Pura Estética'],
      price: '100-250€ por colaboración',
      availability: 'Entre semana por las tardes',
      socials: [{ platform: 'INSTAGRAM', handle: '@sofia.navarro', followers: 22000, engagementRate: 5.0 }]
    },
    {
      displayName: 'Pablo Herrera',
      city: 'Madrid',
      categories: ['Tecnología', 'Humor'],
      languages: ['Español', 'Inglés'],
      bio: 'Reviews de gadgets y humor tech. Contenido corto para TikTok e Instagram Reels.',
      brands: ['TechStore', 'GadgetHub'],
      price: '250-600€ por colaboración',
      availability: 'Disponible fines de semana',
      socials: [
        { platform: 'INSTAGRAM', handle: '@pablo.herrera', followers: 18000, engagementRate: 3.9 },
        { platform: 'YOUTUBE', handle: 'PabloHerreraTech', followers: 41000, engagementRate: 2.2 }
      ]
    },
    {
      displayName: 'Carla Méndez',
      city: 'Madrid',
      categories: ['Belleza', 'Moda'],
      languages: ['Español', 'Inglés'],
      bio: 'Maquilladora profesional y creadora de contenido de belleza. Tutoriales, reviews de producto y skincare.',
      brands: ['Pura Estética', 'CosméticaBio'],
      price: 'Desde 300€',
      availability: 'Disponible todo el mes',
      socials: [{ platform: 'INSTAGRAM', handle: '@carla.mendez', followers: 60000, engagementRate: 3.3 }]
    },
    {
      displayName: 'Javier Soto',
      city: 'Barcelona',
      categories: ['Tecnología', 'Hogar y decoración'],
      languages: ['Español', 'Catalán', 'Inglés'],
      bio: 'Divulgador tech y smart home. Análisis de producto en vídeo largo y clips cortos para redes.',
      brands: ['SmartHome Store'],
      price: '300-700€ por colaboración',
      availability: 'Entre semana',
      socials: [
        { platform: 'INSTAGRAM', handle: '@javier.soto', followers: 15000, engagementRate: 2.9 },
        { platform: 'YOUTUBE', handle: 'JavierSotoTech', followers: 40000, engagementRate: 3.1 }
      ]
    },
    {
      displayName: 'Nerea Blanco',
      city: 'Bilbao',
      categories: ['Hogar y decoración', 'Lifestyle'],
      languages: ['Español', 'Inglés'],
      bio: 'Interiorismo y decoración de bajo presupuesto. Antes/después de espacios y recomendaciones de tiendas.',
      brands: ['Muebles Norte'],
      price: '150-350€ por colaboración',
      availability: 'Fines de semana',
      socials: [{ platform: 'INSTAGRAM', handle: '@nerea.decora', followers: 35000, engagementRate: 4.4 }]
    },
    {
      displayName: 'Iker Castro',
      city: 'Valencia',
      categories: ['Deportes', 'Fitness'],
      languages: ['Español', 'Inglés'],
      bio: 'Exjugador semiprofesional, ahora creador de contenido deportivo y entrenamientos funcionales.',
      brands: ['FitZone Gym', 'SportWear Co'],
      price: 'Desde 250€',
      availability: 'Disponible todo el mes',
      socials: [{ platform: 'INSTAGRAM', handle: '@iker.castro', followers: 90000, engagementRate: 3.0 }]
    },
    {
      displayName: 'Marta Vidal',
      city: 'Madrid',
      categories: ['Música', 'Lifestyle'],
      languages: ['Español', 'Inglés', 'Italiano'],
      bio: 'Cantante y creadora de contenido musical. Covers, storytime y vida de gira.',
      brands: ['AudioTech', 'Festival Sonora'],
      price: 'A negociar',
      availability: 'Depende de gira',
      socials: [{ platform: 'TIKTOK', handle: '@marta.vidal.music', followers: 300000, engagementRate: 7.2 }]
    },
    {
      displayName: 'Alba Romero',
      city: 'Sevilla',
      categories: ['Humor', 'Lifestyle'],
      languages: ['Español'],
      bio: 'Sketches de humor y comedia observacional del día a día. Colaboraciones integradas con marcas de forma natural.',
      brands: ['Snacks Andaluces', 'Pura Estética'],
      price: 'Desde 500€',
      availability: 'Disponible entre semana',
      socials: [
        { platform: 'TIKTOK', handle: '@alba.romero', followers: 500000, engagementRate: 8.5 },
        { platform: 'INSTAGRAM', handle: '@alba.romero', followers: 50000, engagementRate: 4.1 }
      ]
    }
  ];

  const creatorIds: Record<string, string> = {};

  for (const c of creatorSeeds) {
    const username = slugify(c.displayName, { lower: true, strict: true });
    const email = `${username}@influply.com`;
    const userId = randomUUID();
    await db.insert(users).values({ id: userId, email, passwordHash, role: 'CREATOR', name: c.displayName });

    const creatorId = randomUUID();
    await db.insert(creatorProfiles).values({
      id: creatorId,
      userId,
      displayName: c.displayName,
      username,
      avatarUrl: avatar(`${username}-avatar`),
      city: c.city,
      bio: c.bio,
      categories: toJsonArray(c.categories),
      languages: toJsonArray(c.languages),
      brandsWorkedWith: toJsonArray(c.brands),
      priceApprox: c.price,
      availability: c.availability,
      onboardingDone: true
    });
    creatorIds[c.displayName] = creatorId;

    for (const s of c.socials) {
      await db.insert(socialNetworks).values({
        id: randomUUID(),
        creatorId,
        platform: s.platform,
        handle: s.handle,
        followers: s.followers,
        engagementRate: s.engagementRate
      });
    }

    // 3 portfolio photos + occasionally an external video link.
    for (let i = 0; i < 3; i++) {
      await db.insert(portfolioItems).values({
        id: randomUUID(),
        creatorId,
        type: 'PHOTO',
        url: wide(`${username}-portfolio-${i}`),
        caption: null,
        brand: c.brands[i] ?? null,
        order: i
      });
    }
    if (c.brands.length > 0) {
      await db.insert(portfolioItems).values({
        id: randomUUID(),
        creatorId,
        type: 'VIDEO',
        externalVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        caption: `Colaboración con ${c.brands[0]}`,
        brand: c.brands[0],
        order: 3
      });
    }

    console.log(`Creador creado: ${c.displayName} (${email})`);
  }

  // ---------------------------------------------------------------------
  // Campaigns
  // ---------------------------------------------------------------------
  type CampaignSeed = {
    company: string;
    title: string;
    description: string;
    objective: string;
    category: string;
    location: string;
    creatorTypes: string[];
    minFollowers?: number;
    mainPlatform?: string;
    compensationTypes: string[];
    budgetApprox?: string;
    contentRequested: { type: string; qty: number }[];
    coverSeed: string;
    status?: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  };

  const campaignSeeds: CampaignSeed[] = [
    {
      company: 'Café Lúmina',
      title: 'Prueba nuestro nuevo brunch de otoño',
      description:
        'Buscamos creadores de gastronomía en Madrid para venir a probar nuestra nueva carta de brunch de temporada y compartirlo con su comunidad.',
      objective: 'Dar a conocer la nueva carta de brunch entre público joven de Madrid.',
      category: 'Gastronomía',
      location: 'Madrid',
      creatorTypes: ['MICROINFLUENCER', 'INSTAGRAM_CREATOR'],
      minFollowers: 5000,
      mainPlatform: 'Instagram',
      compensationTypes: ['FOOD', 'PAID'],
      budgetApprox: '100-150€ + consumición',
      contentRequested: [
        { type: 'REEL', qty: 1 },
        { type: 'STORY', qty: 3 }
      ],
      coverSeed: 'campaign-brunch'
    },
    {
      company: 'Café Lúmina',
      title: 'Reels para el lanzamiento de nuestra carta de invierno',
      description: 'Necesitamos 2-3 reels cortos mostrando los nuevos platos de nuestra carta de invierno.',
      objective: 'Generar contenido en vídeo reutilizable para nuestras propias redes.',
      category: 'Gastronomía',
      location: 'Madrid',
      creatorTypes: ['UGC_CREATOR', 'INSTAGRAM_CREATOR'],
      minFollowers: 2000,
      mainPlatform: 'Instagram',
      compensationTypes: ['FOOD', 'PAID'],
      budgetApprox: '150-250€',
      contentRequested: [{ type: 'REEL', qty: 3 }],
      coverSeed: 'campaign-winter-menu'
    },
    {
      company: 'Hotel Marisol',
      title: 'Escapada de fin de semana con contenido para Instagram',
      description:
        'Te invitamos a una estancia de 2 noches en nuestro hotel a cambio de contenido para Instagram mostrando las habitaciones, el spa y la piscina infinita.',
      objective: 'Aumentar reservas de fin de semana a través de contenido aspiracional.',
      category: 'Turismo',
      location: 'Málaga',
      creatorTypes: ['INFLUENCER', 'LIFESTYLE_CREATOR'],
      minFollowers: 15000,
      mainPlatform: 'Instagram',
      compensationTypes: ['FREE_EXPERIENCE', 'HOTEL'],
      budgetApprox: 'Estancia de 2 noches para 2 personas',
      contentRequested: [
        { type: 'REEL', qty: 2 },
        { type: 'STORY', qty: 5 },
        { type: 'POST', qty: 1 }
      ],
      coverSeed: 'campaign-hotel-weekend'
    },
    {
      company: 'Hotel Marisol',
      title: 'Vídeo promocional para nuestra piscina infinita',
      description: 'Buscamos un creador de viajes para grabar un vídeo cinematográfico de nuestra piscina infinita al atardecer.',
      objective: 'Contenido de marca para web y redes propias.',
      category: 'Turismo',
      location: 'Málaga',
      creatorTypes: ['VIDEOGRAPHER'],
      minFollowers: 10000,
      mainPlatform: 'Instagram',
      compensationTypes: ['FREE_EXPERIENCE', 'PAID'],
      budgetApprox: '200€ + estancia',
      contentRequested: [{ type: 'REEL', qty: 1 }],
      coverSeed: 'campaign-hotel-pool'
    },
    {
      company: 'FitZone Gym',
      title: 'Buscamos creador fitness para reto de 30 días',
      description: 'Únete a nuestro reto de 30 días de entrenamiento funcional y documenta tu progreso en redes.',
      objective: 'Captar nuevos socios mostrando resultados reales.',
      category: 'Fitness',
      location: 'Barcelona',
      creatorTypes: ['MICROINFLUENCER', 'INFLUENCER'],
      minFollowers: 8000,
      mainPlatform: 'Instagram',
      compensationTypes: ['PAID', 'FREE_EXPERIENCE'],
      budgetApprox: '300-500€',
      contentRequested: [
        { type: 'REEL', qty: 4 },
        { type: 'STORY', qty: 10 }
      ],
      coverSeed: 'campaign-fitness-challenge'
    },
    {
      company: 'FitZone Gym',
      title: 'Contenido UGC para nuestras nuevas clases de spinning',
      description: 'Necesitamos vídeos cortos estilo UGC mostrando la energía de nuestras nuevas clases de spinning.',
      objective: 'Anuncios pagados en redes con contenido auténtico.',
      category: 'Fitness',
      location: 'Barcelona',
      creatorTypes: ['UGC_CREATOR'],
      minFollowers: 1000,
      mainPlatform: 'TikTok',
      compensationTypes: ['PAID'],
      budgetApprox: '150-300€',
      contentRequested: [{ type: 'UGC_VIDEO', qty: 3 }],
      coverSeed: 'campaign-spinning'
    },
    {
      company: 'Nómada Ropa',
      title: 'Campaña cápsula otoño-invierno',
      description: 'Buscamos creadores de moda para presentar nuestra nueva colección cápsula de otoño-invierno.',
      objective: 'Lanzamiento de colección con alcance nacional.',
      category: 'Moda',
      location: 'Valencia',
      creatorTypes: ['INFLUENCER', 'LIFESTYLE_CREATOR'],
      minFollowers: 20000,
      mainPlatform: 'Instagram',
      compensationTypes: ['PAID', 'FREE_PRODUCT'],
      budgetApprox: '400-800€',
      contentRequested: [
        { type: 'POST', qty: 2 },
        { type: 'STORY', qty: 6 }
      ],
      coverSeed: 'campaign-capsule'
    },
    {
      company: 'Nómada Ropa',
      title: 'Necesitamos fotos de producto lifestyle',
      description: 'Sesión de fotos lifestyle con nuestras prendas en exteriores para catálogo online.',
      objective: 'Renovar el catálogo de producto de la tienda online.',
      category: 'Moda',
      location: 'Valencia',
      creatorTypes: ['PHOTOGRAPHER'],
      minFollowers: 3000,
      mainPlatform: 'Instagram',
      compensationTypes: ['PAID', 'FREE_PRODUCT'],
      budgetApprox: '250-400€',
      contentRequested: [{ type: 'PHOTO', qty: 15 }],
      coverSeed: 'campaign-lookbook'
    },
    {
      company: 'Pura Estética',
      title: 'Prueba de nuestro nuevo tratamiento facial',
      description: 'Te invitamos a probar nuestro nuevo tratamiento facial de radiofrecuencia y compartir tu experiencia.',
      objective: 'Dar a conocer un tratamiento nuevo entre público de belleza.',
      category: 'Belleza',
      location: 'Sevilla',
      creatorTypes: ['MICROINFLUENCER', 'INSTAGRAM_CREATOR'],
      minFollowers: 5000,
      mainPlatform: 'Instagram',
      compensationTypes: ['FREE_EXPERIENCE'],
      budgetApprox: 'Tratamiento valorado en 120€',
      contentRequested: [{ type: 'STORY', qty: 4 }],
      coverSeed: 'campaign-facial'
    },
    {
      company: 'Pura Estética',
      title: 'Vídeo antes/después de tratamiento corporal',
      description: 'Buscamos creador de belleza dispuesto a documentar un tratamiento corporal completo (4 sesiones) en formato antes/después.',
      objective: 'Contenido de prueba social para campañas pagadas.',
      category: 'Belleza',
      location: 'Sevilla',
      creatorTypes: ['UGC_CREATOR', 'INSTAGRAM_CREATOR'],
      minFollowers: 3000,
      mainPlatform: 'Instagram',
      compensationTypes: ['FREE_EXPERIENCE', 'PAID'],
      budgetApprox: '100€ + tratamiento',
      contentRequested: [{ type: 'REEL', qty: 1 }],
      coverSeed: 'campaign-body-treatment'
    }
  ];

  const campaignIds: { id: string; company: string; title: string }[] = [];

  for (const c of campaignSeeds) {
    const campaignId = randomUUID();
    await db.insert(campaigns).values({
      id: campaignId,
      companyId: companyIds[c.company],
      title: c.title,
      description: c.description,
      objective: c.objective,
      category: c.category,
      location: c.location,
      startDate: null,
      applicationDeadline: null,
      creatorTypes: toJsonArray(c.creatorTypes),
      requirements: toJsonObject({ minFollowers: c.minFollowers, mainPlatform: c.mainPlatform }),
      compensationTypes: toJsonArray(c.compensationTypes),
      budgetApprox: c.budgetApprox,
      contentRequested: toJsonArray(c.contentRequested),
      coverImageUrl: wide(c.coverSeed),
      status: c.status ?? 'ACTIVE'
    });
    campaignIds.push({ id: campaignId, company: c.company, title: c.title });
    console.log(`Campaña creada: ${c.title} (${c.company})`);
  }

  // ---------------------------------------------------------------------
  // Applications — so both dashboards have real, varied data to show.
  // ---------------------------------------------------------------------
  const byTitle = (title: string) => campaignIds.find((c) => c.title === title)!.id;
  const byCreator = (name: string) => creatorIds[name];

  type AppSeed = { campaign: string; creator: string; message: string; status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' };

  const appSeeds: AppSeed[] = [
    {
      campaign: 'Prueba nuestro nuevo brunch de otoño',
      creator: 'Laura Gómez',
      message: 'Me encantaría colaborar, vivo cerca y suelo hacer contenido de brunch cada fin de semana.',
      status: 'ACCEPTED'
    },
    {
      campaign: 'Reels para el lanzamiento de nuestra carta de invierno',
      creator: 'Laura Gómez',
      message: 'He visto vuestra carta anterior y me encajaría perfecto con mi feed.',
      status: 'PENDING'
    },
    {
      campaign: 'Escapada de fin de semana con contenido para Instagram',
      creator: 'Diego Fernández',
      message: 'Justo estoy planeando una ruta por la Costa del Sol el mes que viene, encajaría genial.',
      status: 'PENDING'
    },
    {
      campaign: 'Vídeo promocional para nuestra piscina infinita',
      creator: 'Diego Fernández',
      message: 'Tengo equipo de dron y experiencia grabando hoteles, os paso mi portfolio.',
      status: 'REJECTED'
    },
    {
      campaign: 'Buscamos creador fitness para reto de 30 días',
      creator: 'Marc Puig',
      message: 'Llevo 3 años documentando retos de entrenamiento, me apunto sin duda.',
      status: 'ACCEPTED'
    },
    {
      campaign: 'Contenido UGC para nuestras nuevas clases de spinning',
      creator: 'Iker Castro',
      message: 'Entreno en gimnasios similares habitualmente, puedo grabar esta semana.',
      status: 'PENDING'
    },
    {
      campaign: 'Campaña cápsula otoño-invierno',
      creator: 'Aitana Ruiz',
      message: 'Vuestra colección encaja perfecto con mi estilo, tengo total disponibilidad este mes.',
      status: 'ACCEPTED'
    },
    {
      campaign: 'Necesitamos fotos de producto lifestyle',
      creator: 'Aitana Ruiz',
      message: 'Puedo encargarme también de la parte de estilismo si os interesa.',
      status: 'PENDING'
    },
    {
      campaign: 'Prueba de nuestro nuevo tratamiento facial',
      creator: 'Sofía Navarro',
      message: 'Me interesa mucho, hago bastante contenido de belleza y cuidado facial.',
      status: 'COMPLETED'
    },
    {
      campaign: 'Prueba de nuestro nuevo tratamiento facial',
      creator: 'Carla Méndez',
      message: 'Trabajo con varios centros de estética, puedo aportar antes/después de calidad.',
      status: 'PENDING'
    },
    {
      campaign: 'Vídeo antes/después de tratamiento corporal',
      creator: 'Alba Romero',
      message: 'Me viene genial, además puedo darle un toque desenfadado al contenido.',
      status: 'PENDING'
    }
  ];

  for (const a of appSeeds) {
    const applicationId = randomUUID();
    await db.insert(applications).values({
      id: applicationId,
      campaignId: byTitle(a.campaign),
      creatorId: byCreator(a.creator),
      message: a.message,
      status: a.status
    });
  }
  console.log(`${appSeeds.length} candidaturas creadas.`);

  // ---------------------------------------------------------------------
  // Favorites — a few saved campaigns/creators so the "Guardados" views aren't empty.
  // ---------------------------------------------------------------------
  const laura = await db.query.users.findFirst({ where: (t, { eq }) => eq(t.email, 'laura-gomez@influply.com') });
  const cafeLumina = await db.query.users.findFirst({ where: (t, { eq }) => eq(t.email, 'cafe-lumina@influply.com') });

  if (laura) {
    await db.insert(favorites).values([
      { id: randomUUID(), userId: laura.id, targetType: 'CAMPAIGN', targetId: byTitle('Buscamos creador fitness para reto de 30 días') },
      { id: randomUUID(), userId: laura.id, targetType: 'CAMPAIGN', targetId: byTitle('Campaña cápsula otoño-invierno') }
    ]);
  }
  if (cafeLumina) {
    await db.insert(favorites).values([
      { id: randomUUID(), userId: cafeLumina.id, targetType: 'CREATOR', targetId: byCreator('Marc Puig') },
      { id: randomUUID(), userId: cafeLumina.id, targetType: 'CREATOR', targetId: byCreator('Carla Méndez') }
    ]);
  }

  // ---------------------------------------------------------------------
  // Notifications tied to the accepted/rejected applications above.
  // ---------------------------------------------------------------------
  const notifSeeds: { email: string; message: string; relatedUrl?: string }[] = [
    { email: 'laura-gomez@influply.com', message: 'Tu candidatura a "Prueba nuestro nuevo brunch de otoño" ha sido aceptada.' },
    { email: 'diego-fernandez@influply.com', message: 'Tu candidatura a "Vídeo promocional para nuestra piscina infinita" ha sido rechazada.' },
    { email: 'marc-puig@influply.com', message: 'Tu candidatura a "Buscamos creador fitness para reto de 30 días" ha sido aceptada.' },
    { email: 'aitana-ruiz@influply.com', message: 'Tu candidatura a "Campaña cápsula otoño-invierno" ha sido aceptada.' },
    { email: 'cafe-lumina@influply.com', message: 'Laura Gómez se ha postulado a "Reels para el lanzamiento de nuestra carta de invierno".' },
    { email: 'nomada-ropa@influply.com', message: 'Aitana Ruiz se ha postulado a "Necesitamos fotos de producto lifestyle".' }
  ];

  for (const n of notifSeeds) {
    const u = await db.query.users.findFirst({ where: (t, { eq }) => eq(t.email, n.email) });
    if (!u) continue;
    await db.insert(notifications).values({ id: randomUUID(), userId: u.id, type: 'APPLICATION_UPDATE', message: n.message, relatedUrl: n.relatedUrl ?? null });
  }

  console.log('\n✅ Seed completado.');
  console.log(`\nContraseña para todas las cuentas demo: ${DEMO_PASSWORD}`);
  console.log('\nEmpresas:');
  for (const c of companySeeds) console.log(`  ${slugify(c.name, { lower: true, strict: true })}@influply.com`);
  console.log('\nCreadores:');
  for (const c of creatorSeeds) console.log(`  ${slugify(c.displayName, { lower: true, strict: true })}@influply.com`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
