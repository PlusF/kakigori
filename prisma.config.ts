import { existsSync } from "node:fs";
import { defineConfig, env } from "prisma/config";

// Prisma 7 の CLI は .env を自動で読まないため、ここで明示的に読み込む
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
