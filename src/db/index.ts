import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

declare global {
  // eslint-disable-next-line no-var
  var __influplySqlite: Database.Database | undefined;
}

const url = process.env.DATABASE_URL || './dev.db';

// Reuse the connection across hot reloads in dev so we don't leak file
// handles / re-open the sqlite file on every module reload.
  const sqlite = global.__influplySqlite ?? (() => { try { return new Database(url); } catch { return new Database(':memory:'); } })();sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
if (process.env.NODE_ENV !== 'production') {
  global.__influplySqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
