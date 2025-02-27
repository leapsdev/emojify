import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    databaseId: "YOUR_DATABASE_ID", // これは後でwrangler.tomlから取得します
    accountId: "YOUR_ACCOUNT_ID",   // これは後でwrangler.tomlから取得します
    token: "YOUR_API_TOKEN",        // これは後で環境変数から取得します
  },
} satisfies Config;
