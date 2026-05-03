import type { Request, Response } from "express";
import type { GetKPIsUseCase } from "../../../application/use-cases/GetKPIsUseCase.ts";

// Controlador HTTP que recibe las peticiones y llama al caso de uso.
export class KPIController {
  constructor(private getKPIsUseCase: GetKPIsUseCase) {}

  async getKPIs(req: Request, res: Response) {
    try {
      const { from, to, order_status, product_category } = req.query;
      if (!from || !to) res.status(400).json({ error: 'Missing date range' });
      const kpis = await this.getKPIsUseCase.execute(
        new Date(from as string),
        new Date(to as string),
        order_status as string | undefined,
        product_category as string | undefined
      );
      res.json(kpis);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
    }
  }
}
