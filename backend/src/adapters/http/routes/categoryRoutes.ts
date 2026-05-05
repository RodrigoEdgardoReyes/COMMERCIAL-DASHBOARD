import { Router } from 'express';
import { PrismaClient } from '../../../../generated/prisma/client.js';
import { PrismaSaleRepository } from '../../../infrastructure/repositories/PrismaSaleRepository.js';
import { GetCategoriesUseCase } from '../../../application/use-cases/GetCategoriesUseCase.js';
import { CategoryController } from '../controllers/CategoryController.js';
import { PrismaPg } from '@prisma/adapter-pg';

const router = Router();

// Inicialización de dependencias (repository, use case, controller)
const prismaClient = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const repo = new PrismaSaleRepository(prismaClient);
const useCase = new GetCategoriesUseCase(repo);
const controller = new CategoryController(useCase);

// Mapeo de rutas HTTP a métodos del controlador
router.get('/', (req, res) => controller.getCategories(req, res));

export { router as categoryRouter };