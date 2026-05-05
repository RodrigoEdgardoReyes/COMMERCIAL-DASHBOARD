import type { Request, Response } from 'express';
import type { GetRevenueTrendUseCase } from '../../../application/use-cases/GetRevenueTrendUseCase.js';

export class RevenueTrendController {
  constructor(private readonly getRevenueTrendUseCase: GetRevenueTrendUseCase) {}

  /**
   * GET /api/revenue-trend?from=...&to=...&grain=...&order_status=...&product_category=...
   * Devuelve la tendencia de ingresos en el rango de fechas indicado,
   * aplicando los filtros opcionales si se reciben.
   */
  async getRevenueTrend(req: Request, res: Response) {
    try {
      const { from, to, grain, order_status, product_category } = req.query;
      if (!from || !to) {
        return res.status(400).json({ error: 'Missing date range (from, to)' });
      }
      const data = await this.getRevenueTrendUseCase.execute(
        new Date(from as string),
        new Date(to as string),
        grain as string,
        order_status as string | undefined,
        product_category as string | undefined
      );
      res.json(data);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Internal server error', details: msg });
    }
  }
}