import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';

// Cloudflare D1の環境インターフェース
export interface Env {
  DB: D1Database;
}

// グローバルなD1クライアント
let db: ReturnType<typeof drizzle> | null = null;

// D1データベースへの接続を作成
export function createDb(d1Database: D1Database) {
  const drizzleInstance = drizzle(d1Database);
  // グローバル変数に保存
  db = drizzleInstance;
  return drizzleInstance;
}

// 環境に応じたデータベース接続を作成する関数
export function getDb(d1Database?: D1Database) {
  // すでに接続が確立されている場合はそれを返す
  if (db) {
    return db;
  }

  // Cloudflare Pages/Workers環境
  if (d1Database) {
    db = drizzle(d1Database);
    return db;
  }

  // D1バインディングが存在しない場合（Netlify環境など）
  if (typeof globalThis.process !== 'undefined') {
    // Node.js環境（Netlify）
    throw new Error(`
      Netlify環境ではD1データベースに直接アクセスできません。
      Cloudflare Workersのエッジ関数を使用してAPIを作成し、
      そのAPIを通じてデータベースにアクセスすることを検討してください。
    `);
  }

  throw new Error(
    'D1データベース接続が利用できません。環境変数を確認してください。',
  );
}
