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
    databaseId: '46b84265-304f-4af3-a305-72e3d8654b03', // 新しく作成されたDBのID
    accountId: '41fb2c2e5d8d7e1fdf610e9062b4c06d', // URLから
    token: process.env.CLOUDFLARE_D1_TOKEN, // 環境変数から
  },
} satisfies Config;
