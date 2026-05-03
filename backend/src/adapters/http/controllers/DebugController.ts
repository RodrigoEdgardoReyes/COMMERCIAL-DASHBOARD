import { GetQueryPlanUseCase } from "../../../application/use-cases/GetQueryPlanUseCase.js";
import type { Request, Response } from "express";

export class DebugController {
  constructor(private getQueryPlanUseCase: GetQueryPlanUseCase) {}

  async getPlan(req: Request, res: Response) {
    try {
      const { query: queryName } = req.query;
      let sql: string;
      let params: any[] = [];

      switch (queryName) {
        case "kpis":
          sql = `
          SELECT COALESCE(SUM(fs.item_price), 0) AS gmv
          FROM dwh.fact_sales fs
          JOIN dwh.dim_date dd ON fs.date_key = dd.date_key
          WHERE dd.full_date >= $1::timestamp AND dd.full_date <= $2::timestamp
        `;
          params = ["2017-01-01", "2017-12-31"];
          break;
        case "trend":
          sql = `
          SELECT TO_CHAR(dd.full_date, 'YYYY-MM-DD') AS date,
                 SUM(fs.payment_value_allocated)::float AS revenue
          FROM dwh.fact_sales fs
          JOIN dwh.dim_date dd ON fs.date_key = dd.date_key
          WHERE dd.full_date >= $1::timestamp AND dd.full_date <= $2::timestamp
          GROUP BY date ORDER BY date
        `;
          params = ["2017-01-01", "2017-12-31"];
          break;
        case "rankings":
          sql = `
          SELECT dp.product_id, SUM(fs.item_price)::float AS value
          FROM dwh.fact_sales fs
          JOIN dwh.dim_product dp ON fs.product_key = dp.product_key
          JOIN dwh.dim_date dd ON fs.date_key = dd.date_key
          WHERE dd.full_date >= $1::timestamp AND dd.full_date <= $2::timestamp
          GROUP BY dp.product_id ORDER BY value DESC LIMIT 5
        `;
          params = ["2017-01-01", "2017-12-31"];
          break;
        default:
          return res
            .status(400)
            .json({
              error: "Invalid query name. Use kpis, trend, or rankings.",
            });
      }

      const plan = await this.getQueryPlanUseCase.execute(sql, params);
      res.json({ query: queryName, plan });
    } catch (error) {
      res
        .status(500)
        .json({
          error: "Error generating query plan",
          details: (error as Error).message,
        });
    }
  }
}
