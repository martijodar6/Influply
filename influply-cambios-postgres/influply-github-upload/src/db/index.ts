import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL no está configurada. Añádela en .env (local) o en las variables de entorno de Vercel.');
}

// The Neon HTTP driver is stateless (each query is a fetch() call over
// HTTPS), so unlike the old better-sqlite3 setup there's no file handle or
// socket to cache across hot reloads — we just create the client once.
const sql = neon(url);

export const db = drizzle(sql, { schema });
export type DB = typeof db;
