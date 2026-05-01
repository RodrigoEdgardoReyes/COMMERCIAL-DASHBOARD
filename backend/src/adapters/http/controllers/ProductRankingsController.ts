import type { Request, Response } from 'express';
import type { GetTopProductsUseCase } from '../../../application/use-cases/GetTopProductsUseCase.js';

export class ProductRankingsController {
  constructor(private getTopProductsUseCase: GetTopProductsUseCase) {}

  async getRankings(req: Request, res: Response) {
    try {
      const { from, to, metric, limit } = req.query;
      if (!from || !to) {
        return res.status(400).json({ error: 'Missing date range (from, to)' });
      }
      const data = await this.getTopProductsUseCase.execute(
        new Date(from as string),
        new Date(to as string),
        metric as string,
        limit ? parseInt(limit as string) : 10
      );
      res.json(data);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Internal server error', details: msg });
    }
  }
}