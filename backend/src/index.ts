import "dotenv/config";
import express from "express";
import cors from "cors";

// Routers
import { kpiRouter } from "./adapters/http/routes/kpiRoutes.js";
import { trendRouter } from "./adapters/http/routes/trendRoutes.js";
import { rankingRouter } from "./adapters/http/routes/rankingRoutes.js";
import { categoryRouter } from "./adapters/http/routes/categoryRoutes.js";
import { debugRouter } from "./adapters/http/routes/debugRouter.js";

// ==================================================================
//                    Express App Initialization
// ==================================================================
const app = express();

// CORS: permitir únicamente el origen del frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Parseo de cuerpos JSON
app.use(express.json());

// ==================================================================
//                              API Routes
// ==================================================================
app.use("/api", kpiRouter);                  // KPIs
app.use("/api/trend", trendRouter);          // Tendencia de revenue
app.use("/api/rankings", rankingRouter);     // Ranking de productos
app.use("/api/categories", categoryRouter);  // Categorías
app.use("/api/debug", debugRouter);          // Query plan (debug)

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// ==================================================================
//                              Start Server
// ================================================================== 
const port = process.env.BACKEND_PORT || 3001;
app.listen(port, () => {
  console.log(`🚀 Backend server running on port ${port}`);
});