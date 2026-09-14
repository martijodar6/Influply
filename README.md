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
- **Drizzle ORM** sobre **SQLite** (`better-sqlite3`) en desarrollo — el
  mismo esquema porta a Postgres en producción sin reescribir nada (ver
  más abajo).
- **NextAuth (Credentials)** con sesiones JWT — sin proveedor externo, con
  recuperación de contraseña por email real (o consola en local).
- **Tailwind CSS** para todo el sistema visual.
- Subida de imágenes con **sharp** (optimización automática a WebP).

## Puesta en marcha local

```bash
npm install
cp .env.example .env      # revisa los valores, funcionan tal cual en local
npm run db:push           # crea/actualiza las tablas de SQLite (dev.db)
npm run seed              # datos de demo: 5 empresas, 12 creadores, 10 campañas
npm run dev                # http://localhost:3000
```

No hace falta ninguna clave externa para probar la app en local: el envío
de emails de recuperación de contraseña cae automáticamente a "imprimir el
enlace en la consola del servidor" si no configuras SMTP (ver más abajo).

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
  db/                   schema.ts (Drizzle), index.ts (conexión), seed.ts.
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

La app está lista para desplegar, pero **tres piezas están en modo
"desarrollo local" por diseño** y hay que configurarlas antes de un
despliegue real:

### 1. Base de datos: pasar de SQLite a Postgres

SQLite (con `better-sqlite3`) es perfecto para desarrollar y probar, pero
la mayoría de plataformas serverless (Vercel incluida) no tienen un disco
persistente para guardar el archivo `.db`. Antes de desplegar:

1. Crea una base de datos Postgres (p.ej. [Neon](https://neon.tech) o
   [Supabase](https://supabase.com) tienen plan gratuito).
2. Cambia el dialecto de Drizzle:
   - `drizzle.config.ts`: `dialect: 'postgresql'`.
   - `src/db/index.ts`: sustituye `better-sqlite3` por
     `drizzle-orm/node-postgres` (o `drizzle-orm/neon-serverless` si usas
     Neon) — es un cambio de un puñado de líneas, el `schema.ts` **no
     necesita tocarse**: los campos "lista" están guardados como texto
     JSON precisamente para que el mismo esquema funcione en ambos
     motores.
   - `npm install pg` (o el driver del proveedor que elijas) y quita
     `better-sqlite3` si ya no lo usas en ningún sitio.
3. Pon la cadena de conexión en `DATABASE_URL` en las variables de entorno
   de tu plataforma de despliegue.
4. Ejecuta `npm run db:push` apuntando a la base de datos de producción
   (o `npm run db:generate` + una migración si prefieres ese flujo).

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

Antes de desplegar en una plataforma serverless:

1. Crea un bucket (S3, Cloudflare R2, o Vercel Blob).
2. Implementa el driver `"s3"` en `src/lib/storage.ts` — la función
   `saveUpload()` ya está aislada exactamente para esto: el resto de la
   aplicación llama siempre a `saveUpload()` y nunca sabe ni le importa
   dónde acaban los archivos, así que este es el único fichero que hay
   que tocar.
3. Pon `STORAGE_DRIVER="s3"` y las credenciales del bucket en las
   variables de entorno.

### Pasos de despliegue (ejemplo con Vercel)

```bash
# 1. Sube el proyecto a un repositorio Git (GitHub, GitLab...)
git init && git add . && git commit -m "Influply MVP"
git remote add origin <tu-repo>
git push -u origin main

# 2. En vercel.com: "Import Project" desde ese repositorio.
# 3. Añade las variables de entorno de .env.example en el panel del
#    proyecto (Settings → Environment Variables), con los valores reales
#    de Postgres/SMTP/almacenamiento descritos arriba.
# 4. Despliega. Vercel ejecuta `npm run build` automáticamente.
# 5. Corre `npm run db:push` una vez contra la base de datos de
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
| `DATABASE_URL` | Sí | Cadena de conexión a Postgres. |
| `NEXTAUTH_SECRET` | Sí | Firma las sesiones. Genera una con `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Sí | URL pública de la app (p.ej. `https://influply.com`). |
| `SMTP_HOST`/`PORT`/`USER`/`PASSWORD`/`FROM` | Recomendado | Envío real de emails de recuperación. |
| `STORAGE_DRIVER` + `S3_*` | Necesario si despliegas en Vercel/serverless | Dónde se guardan las imágenes subidas. |

## Notas de diseño

- Los campos "lista" del esquema (categorías, idiomas, tipos de
  compensación, contenido solicitado...) se guardan como texto JSON en
  vez de arrays/enums nativos de la base de datos — es lo que permite que
  el mismo `schema.ts` funcione sin cambios en SQLite (dev) y Postgres
  (producción).
- Los asistentes de varios pasos (alta de perfil, creación de campaña)
  mantienen todos los pasos montados en el DOM (ocultos con CSS) dentro
  de un único `<form>`, para que un solo envío capture los campos de
  todos los pasos sin importar en cuál esté el usuario — ver
  `src/components/onboarding/stepper.tsx`.
- El acceso a cada pantalla está restringido por rol
  (`src/lib/session.ts`, `src/lib/guards.ts`): un creador nunca ve las
  pantallas de empresa y viceversa, y el onboarding es obligatorio antes
  de acceder al panel correspondiente.
