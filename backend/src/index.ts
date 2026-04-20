// Importa Express, el framework para crear el servidor HTTP.
import express from 'express';

// Importa CORS, middleware que permite peticiones desde otros orígenes (ej. frontend).
import cors from 'cors';

// Importa dotenv, librería que carga variables de entorno desde archivos .env.
import dotenv from 'dotenv';

// Carga las variables de entorno definidas en un archivo .env.
dotenv.config({ path: './backend/.env' });

// Crea la aplicación Express.
const app = express();

// Define el puerto del servidor, tomando la variable BACKEND_PORT del .env.
// Si no existe, usa el puerto 3001 por defecto.
const port = process.env.BACKEND_PORT || 3001;

// Aplica el middleware CORS para permitir peticiones desde el frontend.
app.use(cors());

// Aplica el middleware para parsear JSON en las peticiones.
app.use(express.json());

// Define una ruta de prueba /health para verificar que el servidor está activo.
// Devuelve un objeto con estado OK y un timestamp.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Lugar donde se montarán las rutas de los controladores.
// Ejemplo: app.use('/kpis', kpiRouter);
 
// Inicia el servidor en el puerto definido y muestra un mensaje en consola.
app.listen(port, () => {
  console.log(`🚀 Backend server running on port ${port}`);
});
