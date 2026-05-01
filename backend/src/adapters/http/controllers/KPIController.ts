import type { Request, Response } from "express";
import type { GetKPIsUseCase } from "../../../application/use-cases/GetKPIsUseCase.ts";

// Controlador HTTP que recibe las peticiones y llama al caso de uso.
export class KPIController {
  constructor(private getKPIsUseCase: GetKPIsUseCase) {}

  async getKPIs(req: Request, res: Response) {
    try {
      const { from, to } = req.query;

      //Se validan que las fechas estén presentes.
      if (!from || !to) {
        return res.status(400).json({ error: "Missing date range" });
      }

      //Ejecutamos el caso de uso con las fechas.
      const kpis = await this.getKPIsUseCase.execute(
        new Date(from as string),
        new Date(to as string),
      );

      //Respondemos con los KPIs en formato JSON.
      res.json(kpis);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error in getKPIs:", errorMessage);
      res
        .status(500)
        .json({ error: "Internal server error", details: errorMessage });
    }
  }
}
