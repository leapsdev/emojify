import { drizzle } from 'drizzle-orm/d1';
import { D1Database } from '@cloudflare/workers-types';

// Cloudflare D1の環境インターフェース
export interface Env {
  DB: D1Database;
}

// D1データベースへの接続を作成
export function createDb(env: Env) {
  return drizzle(env.DB);
}

// グローバルなD1クライアント
const db: ReturnType<typeof drizzle> | null = null;

// D1データベースへのアクセスを提供する関数
export function getDb() {
  if (!db) {
    throw new Error('D1データベース接続が利用できません。Cloudflare環境で実行してください。');
  }
  
  return db;
}
