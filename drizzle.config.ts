import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // 本番環境以外はローカルのPostgreSQLに接続
    url:
      process.env.NODE_ENV === 'production'
        ? (process.env.DATABASE_URL as string)
        : (process.env.DATABASE_DEV_URL as string),
  },
});
