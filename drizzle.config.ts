import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    databaseId: 'd566e42c-0039-46a5-b465-69d445500e82',
    accountId: '', // D1データベース作成時に使用したCloudflareアカウントID
    token: '', // Cloudflare API Token
  },
  verbose: true,
  strict: true,
});
