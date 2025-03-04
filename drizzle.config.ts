import { defineConfig } from 'drizzle-kit';

// 開発環境かどうかを判定
const isDevelopment = process.env.NODE_ENV === 'development';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // 開発環境の場合はDATABASE_DEV_URLを使用
    url: isDevelopment ? (process.env.DATABASE_DEV_URL as string) : (process.env.DATABASE_URL as string),
  },
});
