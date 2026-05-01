import { Router } from 'express';
import { PrismaClient } from '../../../../generated/prisma/client.js';
import { PrismaSaleRepository } from '../../../infrastructure/repositories/PrismaSaleRepository.js';
import { GetRevenueTrendUseCase } from '../../../application/use-cases/GetRevenueTrendUseCase.js';
import { RevenueTrendController } from '../controllers/RevenueTrendController.js';
import { PrismaPg } from '@prisma/adapter-pg';

const router = Router();

const prismaClient = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const repo = new PrismaSaleRepository(prismaClient);
const useCase = new GetRevenueTrendUseCase(repo);
const controller = new RevenueTrendController(useCase);

router.get('/revenue', (req, res) => controller.getRevenueTrend(req, res));

export { router as trendRouter };