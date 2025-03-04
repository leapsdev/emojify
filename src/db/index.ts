import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | ReturnType<typeof drizzleNode> | null = null;

export function getDb() {
  if (!_db) {
    // 本番環境以外はローカルのPostgreSQLに接続
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not defined');
      }
      const sql = neon(process.env.DATABASE_URL);
      _db = drizzle(sql, { schema });
    } else {
      if (!process.env.DATABASE_DEV_URL) {
        throw new Error('DATABASE_DEV_URL is not defined');
      }
      const pool = new Pool({
        connectionString: process.env.DATABASE_DEV_URL,
      });
      _db = drizzleNode(pool, { schema });
    }
  }
  return _db;
}
