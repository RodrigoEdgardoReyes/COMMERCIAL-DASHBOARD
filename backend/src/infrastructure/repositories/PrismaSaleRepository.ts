import { PrismaClient } from "@prisma/client/scripts/default-index.js";
import type { SaleRepository } from "../../domain/ports/SaleRepository.ts";
import type { KPIs } from "../../domain/entities/KPIs.ts";
import type { TrendPoint } from "../../domain/entities/TrendPoint.js";
import type { ProductRanking } from "../../domain/entities/ProductRanking.js";

// Interfaz para la fila cruda devuelta por la consulta
interface RawTrendRow {
date: string;
revenue: string;   
orders: string;    
}

interface RawProductRow {
  product_id: string;
  product_category: string;
  metric: string;   
}

export class PrismaSaleRepository implements SaleRepository {
  constructor(private prisma: PrismaClient) {}

  async getKPIs(startDate: Date, endDate: Date): Promise<KPIs> {
    // GMV: suma de item_price en fact_sales
    const gmvResult = await this.prisma.fact_sales.aggregate({
      _sum: { item_price: true },
      where: {
        dim_order: {
          order_purchase_timestamp: { gte: startDate, lte: endDate },
        },
      },
    });
    const gmv = gmvResult._sum.item_price || 0;

    // Revenue: suma del pago prorrateado
    const revenueResult = await this.prisma.fact_sales.aggregate({
      _sum: { payment_value_allocated: true },
      where: {
        dim_order: {
          order_purchase_timestamp: { gte: startDate, lte: endDate },
        },
      },
    });
    const revenue = revenueResult._sum.payment_value_allocated || 0;

    // Número de órdenes distintas
    const ordersCount = await this.prisma.fact_sales.findMany({
      where: {
        dim_order: {
          order_purchase_timestamp: { gte: startDate, lte: endDate },
        },
      },
      distinct: ["order_id"],
      select: { order_id: true },
    });
    const orders = ordersCount.length;

    // AOV
    const aov = orders > 0 ? gmv / orders : 0;

    // IPO (ítems por orden)
    const totalItems = await this.prisma.fact_sales.count({
      where: {
        dim_order: {
          order_purchase_timestamp: { gte: startDate, lte: endDate },
        },
      },
    });
    const ipo = orders > 0 ? totalItems / orders : 0;

    // Tasa de cancelación
    const canceledCount = await this.prisma.fact_sales.count({
      where: {
        dim_order: {
          order_purchase_timestamp: { gte: startDate, lte: endDate },
        },
        is_canceled: true,
      },
    });
    const cancelRate = orders > 0 ? canceledCount / orders : 0;

    // Entregas a tiempo
    const onTimeCount = await this.prisma.fact_sales.count({
      where: {
        dim_order: {
          order_purchase_timestamp: { gte: startDate, lte: endDate },
        },
        is_on_time: true,
        is_delivered: true,
      },
    });
    const deliveredCount = await this.prisma.fact_sales.count({
      where: {
        dim_order: {
          order_purchase_timestamp: { gte: startDate, lte: endDate },
        },
        is_delivered: true,
      },
    });
    const onTimeRate = deliveredCount > 0 ? onTimeCount / deliveredCount : 0;

    return { gmv, revenue, orders, aov, ipo, cancelRate, onTimeRate };
  }


async getRevenueTrend(startDate: Date, endDate: Date, grain: string): Promise<TrendPoint[]> {
  // Consulta SQL cruda para obtener la tendencia de ingresos por día, semana o mes.
  const result = await this.prisma.$queryRaw<RawTrendRow[]>`
    SELECT 
      TO_CHAR(dd.full_date, 'YYYY-MM-DD') AS date,
      SUM(fs.payment_value_allocated) AS revenue,
      COUNT(DISTINCT fs.order_id) AS orders
    FROM dwh.fact_sales fs
    JOIN dwh.dim_date dd ON fs.date_key = dd.date_key
    WHERE dd.full_date >= ${startDate}::timestamp
      AND dd.full_date <= ${endDate}::timestamp
    GROUP BY date
    ORDER BY date;
  `;

  // Convertir los resultados crudos a TrendPoint, parseando los números.
  return result.map((row: RawTrendRow) => ({
    date: row.date,
    revenue: Number(row.revenue),
    orders: Number(row.orders),
  }));
}

async getTopProducts(startDate: Date, endDate: Date, metric: string, limit: number): Promise<ProductRanking[]> {
  const metricColumn = metric === 'revenue' ? 'fs.payment_value_allocated' : 'fs.item_price';

  const query = `
    SELECT
      dp.product_id,
      dp.product_category AS product_category,
      SUM(${metricColumn})::float AS metric
    FROM dwh.fact_sales fs
    JOIN dwh.dim_product dp ON fs.product_key = dp.product_key
    JOIN dwh.dim_date dd ON fs.date_key = dd.date_key
    WHERE dd.full_date >= $1::timestamp
      AND dd.full_date <= $2::timestamp
    GROUP BY dp.product_id, dp.product_category
    ORDER BY metric DESC
    LIMIT $3;
  `;

  // Sin parámetro de tipo; resultado es any[]
  const result = await this.prisma.$queryRawUnsafe(
    query,
    startDate,
    endDate,
    limit
  );

  // Mapeo explícito con tipo RawProductRow en el parámetro
  return (result as any[]).map((row: RawProductRow) => ({
    product_id: row.product_id,
    product_category: row.product_category,
    metric: Number(row.metric),
  }));
}
}