import "dotenv/config";

// Importa Express, el framework para crear el servidor HTTP.
import express from "express";

// Importa el router de KPIs, que contiene las rutas relacionadas a los KPIs.
import { kpiRouter } from "./adapters/http/routes/kpiRoutes.js";

// Importa los routers de tendencias y rankings, que contienen las rutas relacionadas a la tendencia de ingresos y al ranking de productos.
import { trendRouter } from "./adapters/http/routes/trendRoutes.js";

// Importa el router de rankings, que contiene las rutas relacionadas al ranking de productos.
import { rankingRouter } from "./adapters/http/routes/rankingRoutes.js";

// Importa CORS, middleware que permite peticiones desde otros orígenes (ej. frontend).
import cors from "cors";

// Carga las variables de entorno definidas en un archivo .env.
// dotenv.config({ path: './backend/.env' });

// Crea la aplicación Express.
const app = express();

// Aplica el middleware CORS para permitir peticiones desde el frontend.
app.use(cors({
    origin: "http://localhost:3002",
    methods: ["GET", "POST"],
  }),
);
// app.use(cors());

// Define el puerto del servidor, tomando la variable BACKEND_PORT del .env.
// Si no existe, usa el puerto 3001 por defecto.
const port = process.env.BACKEND_PORT || 3001;

// Monta el router de KPIs en la ruta /api/kpis
app.use("/api", kpiRouter);
// Aplica el middleware para parsear JSON en las peticiones.
app.use(express.json());

// Monta los routers de tendencias y rankings en sus respectivas rutas. : GET /api/trend/revenue
app.use("/api/trend", trendRouter);

// Montar el router de rankings para manejar las rutas relacionadas al ranking de productos. : GET /api/rankings/products
app.use("/api/rankings", rankingRouter);

// Define una ruta de prueba /health para verificar que el servidor está activo.
// Devuelve un objeto con estado OK y un timestamp.
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// Lugar donde se montarán las rutas de los controladores.
// Ejemplo: app.use('/kpis', kpiRouter);

// Inicia el servidor en el puerto definido y muestra un mensaje en consola.
app.listen(port, () => {
  console.log(`🚀 Backend server running on port ${port}`);
});
