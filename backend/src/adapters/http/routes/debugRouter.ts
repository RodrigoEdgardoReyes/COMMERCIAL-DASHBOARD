import { Router } from 'express';
import { DebugController } from '../controllers/DebugController.js';
import { GetQueryPlanUseCase } from '../../../application/use-cases/GetQueryPlanUseCase.js';
import { DebugRepository } from '../../../infrastructure/repositories/DebugRepository.js';
import { PrismaClient } from '../../../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const router = Router();
const prismaClient = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const debugRepo = new DebugRepository(prismaClient);
const useCase = new GetQueryPlanUseCase(debugRepo);
const controller = new DebugController(useCase);

router.get('/query-plan', (req, res) => controller.getPlan(req, res));

export { router as debugRouter };