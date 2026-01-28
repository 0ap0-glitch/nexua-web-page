import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_3veKskBgJ4Dx@ep-winter-feather-ahodxzah-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
