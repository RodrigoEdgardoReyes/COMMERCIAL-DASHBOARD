/// <reference types="node" />
import "dotenv/config";
import { defineConfig } from "@prisma/config";

// Exporta la configuración de Prisma. Se especifica el archivo de esquema, la ruta de migraciones y la fuente de datos.
export default defineConfig({

  // Indica la ubicación del archivo schema.prisma.
  schema: "prisma/schema.prisma",

  // Ruta de migraciones
  migrations: {
    path: "prisma/migrations",
  },
  datasource: { url: process.env.DATABASE_URL },
  // @ts-ignore — Prisma 7.7.0+ 
  datasourceSchemas: ["public", "raw", "clean", "dwh"],
});
