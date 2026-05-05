import { Router } from 'express';
import { PrismaClient } from '../../../../generated/prisma/client.js';
import { PrismaSaleRepository } from '../../../infrastructure/repositories/PrismaSaleRepository.js';
import { GetTopProductsUseCase } from '../../../application/use-cases/GetTopProductsUseCase.js';
import { ProductRankingsController } from '../controllers/ProductRankingsController.js';
import { PrismaPg } from '@prisma/adapter-pg';

const router = Router();

// Inicialización de dependencias (repository, use case, controller)
const prismaClient = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const repo = new PrismaSaleRepository(prismaClient);
const useCase = new GetTopProductsUseCase(repo);
const controller = new ProductRankingsController(useCase);

// Mapeo de rutas
router.get('/products', (req, res) => controller.getRankings(req, res));

export { router as rankingRouter };