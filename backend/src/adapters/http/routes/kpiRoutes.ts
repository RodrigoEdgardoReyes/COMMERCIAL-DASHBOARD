import { Router } from 'express';
import { PrismaSaleRepository } from "../../../infrastructure/repositories/PrismaSaleRepository.js";
import { GetKPIsUseCase } from "../../../application/use-cases/GetKPIsUseCase.js";
import { KPIController } from "../controllers/KPIController.js";
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../../generated/prisma/client.js';

// Creación del router de Express.
const router = Router();

// Instancia dependencias siguiendo la arquitectura hexagonal.
// const prismaClient = new PrismaClient();
if(!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no esta definida en kpiroutes");
  }
const prismaClient = new PrismaClient({
    adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
    }), 
});

const saleRepo = new PrismaSaleRepository(prismaClient);
const getKPIsUseCase = new GetKPIsUseCase(saleRepo);
const kpiController = new KPIController(getKPIsUseCase);

// Definición de la ruta /api/kpis.
router.get('/kpis', (req, res) => kpiController.getKPIs(req, res));

export { router as kpiRouter }; 
