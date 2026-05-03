import { GetCategoriesUseCase } from '../../../application/use-cases/GetCategoriesUseCase.js';
import type { Request, Response } from 'express';

export class CategoryController {
  constructor(private getCategoriesUseCase: GetCategoriesUseCase) {}

  async getCategories(_req: Request, res: Response) {
    try {
      const categories = await this.getCategoriesUseCase.execute();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}