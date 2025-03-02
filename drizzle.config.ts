import type { Config } from 'drizzle-kit';

if (!process.env.CLOUDFLARE_D1_TOKEN) {
  throw new Error('CLOUDFLARE_D1_TOKEN環境変数が設定されていません');
}

export default {
  schema: './src/db/schema.ts',
  out: './src/db/drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    databaseId: process.env.CLOUDFLARE_DATABASE_ID || '',
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    token: process.env.CLOUDFLARE_D1_TOKEN || '',
  },
} satisfies Config;
