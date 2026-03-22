import type { NextConfig } from "next"

const config: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "prisma", "@prisma/adapter-pg", "pg"],
}

export default config
