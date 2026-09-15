# Influply

Marketplace de dos lados que conecta **empresas/negocios locales** con
**creadores de contenido/influencers** para colaboraciones: las empresas
publican campañas, los creadores las descubren y aplican, y las empresas
seleccionan con quién colaborar.

Esto es una aplicación **real y funcional** — no una maqueta visual — con
autenticación de verdad, base de datos, subida de archivos y los dos flujos
principales completos:

- **Empresa:** registro → perfil → crear campaña → recibir candidatos → seleccionar creador.
- **Creador:** registro → perfil + portfolio → descubrir campañas → aplicar → ver estado de la candidatura.

## Stack técnico

- **Next.js 14** (App Router) + **TypeScript**, con Server Actions para toda
  la lógica de escritura (registro, onboarding, campañas, candidaturas...).
- **Drizzle ORM** sobre **Postgres** ([Neon](https://neon.tech), driver
  serverless por HTTP — `@neondatabase/serverless` + `drizzle-orm/neon-http`),
  la misma base de datos en local y en producción.
- **NextAuth (Credentials)** con sesiones JWT — sin proveedor externo, con
  recuperación de contraseña por email real (o consola en local).
- **Tailwind CSS** para todo el sistema visual.
- Subida de imágenes con **sharp** (optimización automática a WebP) +
  **Vercel Blob** para que los archivos persistan en producción (ver
  "Almacenamiento de archivos" más abajo).

## Puesta en marcha local

```bash
npm install
cp .env.example .env      # rellena DATABASE_URL con tu cadena de Postgres (Neon, Supabase...)
npm run db:push           # crea/actualiza las tablas en esa base de datos
npm run seed              # datos de demo: 5 empresas, 12 creadores, 10 campañas
npm run dev                # http://localhost:3000
```

`DATABASE_URL` es la única variable obligatoria incluso en local — no hay
modo SQLite/archivo local, así que necesitas una base Postgres desde el
principio (el plan gratuito de Neon o Supabase es más que suficiente para
desarrollar). No hace falta ninguna otra clave externa para probar la app:
el envío de emails de recuperación de contraseña cae automáticamente a
"imprimir el enlace en la consola del servidor" si no configuras SMTP (ver
más abajo), y `STORAGE_DRIVER="local"` guarda las imágenes en
`/public/uploads` sin necesitar un bucket.

### Cuentas de demo

Todas las cuentas creadas por `npm run seed` usan la contraseña:

```
Demo1234!
```

Empresas: `cafe-lumina@influply.com`, `hotel-marisol@influply.com`,
`fitzone-gym@influply.com`, `nomada-ropa@influply.com`,
`pura-estetica@influply.com`.

Creadores (12): `laura-gomez@influply.com`, `marc-puig@influply.com`,
`aitana-ruiz@influply.com`, `diego-fernandez@influply.com`,
`sofia-navarro@influply.com`, `pablo-herrera@influply.com`,
`carla-mendez@influply.com`, `javier-soto@influply.com`,
`nerea-blanco@influply.com`, `iker-castro@influply.com`,
`marta-vidal@influply.com`, `alba-romero@influply.com`.

`npm run seed` **borra y vuelve a crear** todos los datos — es seguro
ejecutarlo varias veces, pero no lo corras contra una base de datos con
usuarios reales.

## Estructura del proyecto

```
src/
  app/                  Rutas (App Router): páginas públicas, auth,
                         onboarding, dashboards de empresa y creador.
  actions/              Server Actions (mutaciones): auth, onboarding,
                         campañas/candidaturas, perfil.
  lib/                  auth.ts, session.ts, guards.ts, storage.ts,
                         mailer.ts, queries.ts (lecturas), constants.ts.
  db/                   schema.ts (Drizzle, pg-core), index.ts (conexión
                         Neon), seed.ts.
  components/           UI compartida (botones, cards, stepper, filtros...).
```

Puntos de extensión ya pensados en la arquitectura (no implementados
todavía, pero el modelo de datos y la separación en capas no deberían
necesitar cambios grandes para añadirlos):

- **Pagos y comisión por colaboración** — añade una tabla `payments`
  relacionada con `applications`; `src/actions/campaigns.ts` es donde
  engancharías el cobro al aceptar una candidatura.
- **Chat interno** — una tabla `messages` (`applicationId`, `senderId`,
  `body`, `createdAt`) más una ruta con polling o WebSockets.
- **Contratos digitales, valoraciones, verificación de perfil, analíticas
  de campaña, integración con Instagram/TikTok, matching con IA,
  reputación, suscripciones de empresa** — todos son tablas nuevas que
  cuelgan de `users`, `creatorProfiles`, `companyProfiles` o
  `applications` sin tocar el esquema existente.

## Desplegar a producción

La app ya usa Postgres + Vercel Blob por defecto, así que desplegar es
sobre todo cuestión de variables de entorno. Dos piezas siguen en modo
"desarrollo local" por diseño y conviene revisarlas antes de un despliegue
real:

### 1. Base de datos (Postgres/Neon)

Ya está migrado: `src/db/schema.ts` usa `drizzle-orm/pg-core` y
`src/db/index.ts` se conecta vía `@neondatabase/serverless` +
`drizzle-orm/neon-http` (driver HTTP, sin sockets — funciona bien en
entornos serverless y detrás de proxies restrictivos). Para desplegar:

1. Crea una base de datos Postgres — el proyecto está probado contra
   [Neon](https://neon.tech) (integración nativa de Vercel, "Storage" →
   "Neon"), pero cualquier Postgres accesible por HTTP-driver o por el
   propio `DATABASE_URL` sirve.
2. Conéctala a tu proyecto de Vercel (esto rellena `DATABASE_URL`
   automáticamente si usas la integración de Neon) o pon la cadena de
   conexión a mano en las variables de entorno.
3. Ejecuta `npm run db:push` apuntando a la base de datos de producción
   (o `npm run db:generate` + aplicar el SQL resultante si prefieres ese
   flujo de migraciones versionadas — ver `drizzle/`).
4. Opcional: `npm run seed` para tener datos de demo también en
   producción (¡ojo! borra y recrea todos los datos, no lo ejecutes
   contra una base con usuarios reales).

### 2. Email real para recuperación de contraseña

En local, si no hay SMTP configurado, el enlace de recuperación se
imprime en la consola del servidor (`src/lib/mailer.ts`) — perfecto para
probar, pero nadie va a leer los logs del servidor en producción.

Antes de desplegar, configura un proveedor SMTP real (Resend, Postmark,
SendGrid, o incluso Gmail con contraseña de aplicación) y define en las
variables de entorno:

```
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM="Influply <no-reply@tudominio.com>"
```

En cuanto estas variables existen, `sendPasswordResetEmail` empieza a
enviar correos de verdad automáticamente — no hay que tocar código.

### 3. Almacenamiento de archivos subidos

`STORAGE_DRIVER="local"` (el valor por defecto) guarda las imágenes en
`/public/uploads` en disco. Esto funciona en local y en un servidor propio
con disco persistente, pero **no funciona en Vercel** (su sistema de
archivos es de solo lectura/efímero en producción).

`src/lib/storage.ts` ya tiene un segundo driver, `"vercel-blob"`, listo
para producción:

1. Conecta un almacén de [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
   a tu proyecto (Storage → Blob) — esto rellena `BLOB_READ_WRITE_TOKEN`
   automáticamente.
2. Pon `STORAGE_DRIVER="vercel-blob"` en las variables de entorno de
   producción.

Si prefieres otro proveedor (S3, Cloudflare R2...), añade un driver más en
`saveUpload()` — la función ya está aislada exactamente para esto: el
resto de la aplicación la llama siempre a ella y nunca sabe ni le importa
dónde acaban los archivos.

### Pasos de despliegue (ejemplo con Vercel)

```bash
# 1. Sube el proyecto a un repositorio Git (GitHub, GitLab...)
git init && git add . && git commit -m "Influply MVP"
git remote add origin <tu-repo>
git push -u origin main

# 2. En vercel.com: "Import Project" desde ese repositorio.
# 3. Conecta Storage → Neon (Postgres) y Storage → Blob desde el panel
#    del proyecto — ambos rellenan sus variables de entorno solos.
# 4. Añade el resto de variables de .env.example (NEXTAUTH_SECRET,
#    NEXTAUTH_URL, SMTP_*, STORAGE_DRIVER="vercel-blob") en Settings →
#    Environment Variables.
# 5. Despliega. Vercel ejecuta `npm run build` automáticamente.
# 6. Corre `npm run db:push` una vez contra la base de datos de
#    producción (localmente, con DATABASE_URL apuntando a producción, o
#    desde un script de deploy) antes de la primera visita.
```

Railway, Render o un VPS propio funcionan igual de bien — Next.js no
depende de nada específico de Vercel aquí, y si usas un servidor con
disco persistente propio ni siquiera necesitas tocar el almacenamiento
(el driver `"local"` seguiría funcionando).

### Variables de entorno — resumen

| Variable | Obligatoria en producción | Qué hace |
|---|---|---|
| `DATABASE_URL` | Sí | Cadena de conexión a Postgres (Neon u otro). |
| `NEXTAUTH_SECRET` | Sí | Firma las sesiones. Genera una con `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Sí | URL pública de la app (p.ej. `https://influply.com`). |
| `SMTP_HOST`/`PORT`/`USER`/`PASSWORD`/`FROM` | Recomendado | Envío real de emails de recuperación. |
| `STORAGE_DRIVER` + `BLOB_READ_WRITE_TOKEN` | Necesario si despliegas en Vercel/serverless | Dónde se guardan las imágenes subidas (`"vercel-blob"` en producción). |

## Notas de diseño

- Los campos "lista" del esquema (categorías, idiomas, tipos de
  compensación, contenido solicitado...) se guardan como texto JSON en
  vez de arrays/enums nativos de la base de datos — herencia de cuando el
  proyecto soportaba SQLite además de Postgres; se mantiene porque es
  simple y evita migraciones al añadir valores nuevos a esas listas.
- Los asistentes de varios pasos (alta de perfil, creación de campaña)
  mantienen todos los pasos montados en el DOM (ocultos con CSS) dentro
  de un único `<form>`, para que un solo envío capture los campos de
  todos los pasos sin importar en cuál esté el usuario — ver
  `src/components/onboarding/stepper.tsx`.
- El acceso a cada pantalla está restringido por rol
  (`src/lib/session.ts`, `src/lib/guards.ts`): un creador nunca ve las
  pantallas de empresa y viceversa, y el onboarding es obligatorio antes
  de acceder al panel correspondiente.
