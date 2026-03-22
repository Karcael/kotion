import path from "node:path"
import { defineConfig } from "prisma/config"

// .env dosyasından DATABASE_URL oku
const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://kotion:kotion@localhost:5432/kotion"

export default defineConfig({
  schema: path.join(__dirname, "schema.prisma"),
  datasource: {
    url: databaseUrl,
  },
})
