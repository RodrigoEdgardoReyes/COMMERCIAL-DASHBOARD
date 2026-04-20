// @ts-nocheck
// Desactiva la verificación de tipos de TypeScript para este archivo.
// Se usa cuando el archivo puede contener configuraciones o imports que no están tipados correctamente.

// Importa y ejecuta automáticamente la configuración de dotenv.
// Esto carga las variables de entorno definidas en el archivo .env.
import "dotenv/config";

// Importa la función defineConfig desde prisma/config.
// Esta función permite definir la configuración de Prisma de manera estructurada.
import { defineConfig } from "prisma/config";

// Exporta la configuración de Prisma.
// Se especifica el archivo de esquema, la ruta de migraciones y la fuente de datos.
export default defineConfig({
  // Indica la ubicación del archivo schema.prisma.
  schema: "prisma/schema.prisma",

  // Configura la ruta donde se almacenarán las migraciones generadas por Prisma.
  migrations: {
    path: "prisma/migrations",
  },

  // Define el datasource principal.
  // La URL de conexión se obtiene de la variable de entorno DATABASE_URL.
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
