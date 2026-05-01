/// <reference types="node" />
// Importa y ejecuta automáticamente la configuración de dotenv. Esto carga las variables de entorno definidas en el archivo .env.
import "dotenv/config";

// Importa la función defineConfig desde prisma/config. Esta función permite definir la configuración de Prisma de manera estructurada.
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
  // @ts-ignore — Prisma 7.7.0+ requiere esta propiedad a nivel raíz
  datasourceSchemas: ["public", "raw", "clean", "dwh"],
});
