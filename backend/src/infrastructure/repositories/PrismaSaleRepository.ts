// import { PrismaClient } from "@prisma/client/scripts/default-index.js";
import { PrismaClient } from "../../../generated/prisma/client.js";
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

  // async getKPIs(startDate: Date, endDate: Date, orderStatus?: string, productCategory?: string): Promise<KPIs> {
  //   // GMV: suma de item_price en fact_sales
  //   const gmvResult = await this.prisma.fact_sales.aggregate({
  //     _sum: { item_price: true },
  //     where: {
  //       dim_order: {
  //         order_purchase_timestamp: { gte: startDate, lte: endDate },
  //         order_status: orderStatus,
  //       },
  //     },
  //   });
  //   const gmv = gmvResult._sum.item_price || 0;

  //   // Revenue: suma del pago prorrateado
  //   const revenueResult = await this.prisma.fact_sales.aggregate({
  //     _sum: { payment_value_allocated: true },
  //     where: {
  //       dim_order: {
  //         order_purchase_timestamp: { gte: startDate, lte: endDate },
  //       },
  //     },
  //   });
  //   const revenue = revenueResult._sum.payment_value_allocated || 0;

  //   // Número de órdenes distintas
  //   const ordersCount = await this.prisma.fact_sales.findMany({
  //     where: {
  //       dim_order: {
  //         order_purchase_timestamp: { gte: startDate, lte: endDate },
  //       },
  //     },
  //     distinct: ["order_id"],
  //     select: { order_id: true },
  //   });
  //   const orders = ordersCount.length;

  //   // AOV
  //   const aov = orders > 0 ? gmv / orders : 0;

  //   // IPO (ítems por orden)
  //   const totalItems = await this.prisma.fact_sales.count({
  //     where: {
  //       dim_order: {
  //         order_purchase_timestamp: { gte: startDate, lte: endDate },
  //       },
  //     },
  //   });
  //   const ipo = orders > 0 ? totalItems / orders : 0;

  //   // Tasa de cancelación
  //   const canceledCount = await this.prisma.fact_sales.count({
  //     where: {
  //       dim_order: {
  //         order_purchase_timestamp: { gte: startDate, lte: endDate },
  //       },
  //       is_canceled: true,
  //     },
  //   });
  //   const cancelRate = orders > 0 ? canceledCount / orders : 0;

  //   // Entregas a tiempo
  //   const onTimeCount = await this.prisma.fact_sales.count({
  //     where: {
  //       dim_order: {
  //         order_purchase_timestamp: { gte: startDate, lte: endDate },
  //       },
  //       is_on_time: true,
  //       is_delivered: true,
  //     },
  //   });
  //   const deliveredCount = await this.prisma.fact_sales.count({
  //     where: {
  //       dim_order: {
  //         order_purchase_timestamp: { gte: startDate, lte: endDate },
  //       },
  //       is_delivered: true,
  //     },
  //   });
  //   const onTimeRate = deliveredCount > 0 ? onTimeCount / deliveredCount : 0;

  //   return { gmv, revenue, orders, aov, ipo, cancelRate, onTimeRate };
  // }

  async getKPIs(startDate: Date, endDate: Date, orderStatus?: string, productCategory?: string): Promise<KPIs> {
  // Construimos condiciones dinámicas
  const whereClauses: string[] = [];
  const params: any[] = [];

  // Fecha obligatoria
  whereClauses.push(`dd.full_date >= $${params.length + 1}::timestamp`);
  params.push(startDate);
  whereClauses.push(`dd.full_date <= $${params.length + 1}::timestamp`);
  params.push(endDate);

  // Filtro por estado de orden
  if (orderStatus) {
    whereClauses.push(`o.order_status = $${params.length + 1}`);
    params.push(orderStatus);
  }

  // Filtro por categoría de producto
  if (productCategory) {
    whereClauses.push(`dp.product_category = $${params.length + 1}`);
    params.push(productCategory);
  }

  const filter = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Consulta de GMV
  const gmvQuery = `
    SELECT COALESCE(SUM(fs.item_price), 0) AS gmv
    FROM dwh.fact_sales fs
    JOIN dwh.dim_order o ON fs.order_key = o.order_key
    JOIN dwh.dim_product dp ON fs.product_key = dp.product_key
    JOIN dwh.dim_date dd ON fs.date_key = dd.date_key
    ${filter}
  `;
  const gmvResult = await this.prisma.$queryRawUnsafe(gmvQuery, ...params) as Array<{ gmv: number }>;
  const gmv = Number(gmvResult[0]?.gmv) || 0;

  // Lo mismo para revenue
  const revenueQuery = `
    SELECT COALESCE(SUM(fs.payment_value_allocated), 0) AS revenue
    FROM dwh.fact_sales fs
    JOIN dwh.dim_order o ON fs.order_key = o.order_key
    JOIN dwh.dim_product dp ON fs.product_key = dp.product_key
    JOIN dwh.dim_date dd ON fs.date_key = dd.date_key
    ${filter}
  `;
  const revenueResult = await this.prisma.$queryRawUnsafe(revenueQuery, ...params) as Array<{ revenue: number }>;
  // const revenueResult = await this.prisma.$queryRawUnsafe<Array<{ revenue: number }>>(revenueQuery, ...params);
  const revenue = Number(revenueResult[0]?.revenue) || 0;

  // Cantidad de órdenes distintas
  const ordersQuery = `
    SELECT COUNT(DISTINCT fs.order_id) AS orders
    FROM dwh.fact_sales fs
    JOIN dwh.dim_order o ON fs.order_key = o.order_key
    JOIN dwh.dim_product dp ON fs.product_key = dp.product_key
    JOIN dwh.dim_date dd ON fs.date_key = dd.date_key
    ${filter}
  `;
  const ordersResult = await this.prisma.$queryRawUnsafe(ordersQuery, ...params) as Array<{ orders: number }>;
  const orders = Number(ordersResult[0]?.orders) || 0;

  // AOV
  const aov = orders > 0 ? gmv / orders : 0;

  // IPO: total de items / órdenes
  const itemsQuery = `
    SELECT COUNT(*) AS items
    FROM dwh.fact_sales fs
    JOIN dwh.dim_order o ON fs.order_key = o.order_key
    JOIN dwh.dim_product dp ON fs.product_key = dp.product_key
    JOIN dwh.dim_date dd ON fs.date_key = dd.date_key
    ${filter}
  `;
  const itemsResult = await this.prisma.$queryRawUnsafe(itemsQuery, ...params) as Array<{ items: number }>;
  const totalItems = Number(itemsResult[0]?.items) || 0;
  const ipo = orders > 0 ? totalItems / orders : 0;

  // Tasa de cancelación (necesita unión con estado)
  const canceledQuery = `
    SELECT COUNT(*) AS canceled
    FROM dwh.fact_sales fs
    JOIN dwh.dim_order o ON fs.order_key = o.order_key
    JOIN dwh.dim_product dp ON fs.product_key = dp.product_key
    JOIN dwh.dim_date dd ON fs.date_key = dd.date_key
    ${filter} AND o.order_status = 'canceled'
  `;
  const canceledResult = await this.prisma.$queryRawUnsafe(canceledQuery, ...params) as Array<{ canceled: number }>;
  const canceled = Number(canceledResult[0]?.canceled) || 0;
  const cancelRate = orders > 0 ? canceled / orders : 0;

  // On-time rate
  const onTimeQuery = `
    SELECT COUNT(*) AS on_time
    FROM dwh.fact_sales fs
    JOIN dwh.dim_order o ON fs.order_key = o.order_key
    JOIN dwh.dim_product dp ON fs.product_key = dp.product_key
    JOIN dwh.dim_date dd ON fs.date_key = dd.date_key
    ${filter} AND o.order_status = 'delivered' AND fs.is_on_time = true
  `;
  const onTimeResult = await this.prisma.$queryRawUnsafe(onTimeQuery, ...params) as Array<{ on_time: number }>;
  const onTime = Number(onTimeResult[0]?.on_time) || 0;

  const deliveredQuery = `
    SELECT COUNT(*) AS delivered
    FROM dwh.fact_sales fs
    JOIN dwh.dim_order o ON fs.order_key = o.order_key
    JOIN dwh.dim_product dp ON fs.product_key = dp.product_key
    JOIN dwh.dim_date dd ON fs.date_key = dd.date_key
    ${filter} AND o.order_status = 'delivered'
  `;
  const deliveredResult = await this.prisma.$queryRawUnsafe(deliveredQuery, ...params) as Array<{ delivered: number }>;
  const delivered = Number(deliveredResult[0]?.delivered) || 0;
  const onTimeRate = delivered > 0 ? onTime / delivered : 0;

  return { gmv, revenue, orders, aov, ipo, cancelRate, onTimeRate };
}

// async getRevenueTrend(startDate: Date, endDate: Date, grain: string): Promise<TrendPoint[]> {
//   // Consulta SQL cruda para obtener la tendencia de ingresos por día, semana o mes.
//   const result = await this.prisma.$queryRaw<RawTrendRow[]>`
//     SELECT 
//       TO_CHAR(dd.full_date, 'YYYY-MM-DD') AS date,
//       SUM(fs.payment_value_allocated) AS revenue,
//       COUNT(DISTINCT fs.order_id) AS orders
//     FROM dwh.fact_sales fs
//     JOIN dwh.dim_date dd ON fs.date_key = dd.date_key
//     WHERE dd.full_date >= ${startDate}::timestamp
//       AND dd.full_date <= ${endDate}::timestamp
//     GROUP BY date
//     ORDER BY date;
//   `;

//   // Convertir los resultados crudos a TrendPoint, parseando los números.
//   return result.map((row: RawTrendRow) => ({
//     date: row.date,
//     revenue: Number(row.revenue),
//     orders: Number(row.orders),
//   }));
// }

async getRevenueTrend(startDate: Date, endDate: Date, grain: string, orderStatus?: string, productCategory?: string): Promise<TrendPoint[]> {
  const whereClauses: string[] = [];
  const params: any[] = [];

  whereClauses.push(`dd.full_date >= $${params.length + 1}::timestamp`);
  params.push(startDate);
  whereClauses.push(`dd.full_date <= $${params.length + 1}::timestamp`);
  params.push(endDate);

  if (orderStatus) {
    whereClauses.push(`o.order_status = $${params.length + 1}`);
    params.push(orderStatus);
  }
  if (productCategory) {
    whereClauses.push(`dp.product_category = $${params.length + 1}`);
    params.push(productCategory);
  }

  const filter = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const query = `
    SELECT 
      TO_CHAR(dd.full_date, 'YYYY-MM-DD') AS date,
      SUM(fs.payment_value_allocated)::float AS revenue,
      COUNT(DISTINCT fs.order_id)::int AS orders
    FROM dwh.fact_sales fs
    JOIN dwh.dim_order o ON fs.order_key = o.order_key
    JOIN dwh.dim_product dp ON fs.product_key = dp.product_key
    JOIN dwh.dim_date dd ON fs.date_key = dd.date_key
    ${filter}
    GROUP BY date
    ORDER BY date;
  `;

  const result = await this.prisma.$queryRawUnsafe(query, ...params) as any[];
// Luego el mapeo
return result.map((row: any) => ({
  date: row.date,
  revenue: Number(row.revenue),
  orders: Number(row.orders),
}));
}

// async getTopProducts(startDate: Date, endDate: Date, metric: string, limit: number): Promise<ProductRanking[]> {
//   const metricColumn = metric === 'revenue' ? 'fs.payment_value_allocated' : 'fs.item_price';

//   const query = `
//     SELECT
//       dp.product_id,
//       dp.product_category AS product_category,
//       SUM(${metricColumn})::float AS metric
//     FROM dwh.fact_sales fs
//     JOIN dwh.dim_product dp ON fs.product_key = dp.product_key
//     JOIN dwh.dim_date dd ON fs.date_key = dd.date_key
//     WHERE dd.full_date >= $1::timestamp
//       AND dd.full_date <= $2::timestamp
//     GROUP BY dp.product_id, dp.product_category
//     ORDER BY metric DESC
//     LIMIT $3;
//   `;

//   // Sin parámetro de tipo; resultado es any[]
//   const result = await this.prisma.$queryRawUnsafe(
//     query,
//     startDate,
//     endDate,
//     limit
//   );

//   // Mapeo explícito con tipo RawProductRow en el parámetro
//   return (result as any[]).map((row: RawProductRow) => ({
//     product_id: row.product_id,
//     product_category: row.product_category,
//     metric: Number(row.metric),
//   }));

async getTopProducts(startDate: Date, endDate: Date, metric: string, limit: number, orderStatus?: string, productCategory?: string): Promise<ProductRanking[]> {
  const metricColumn = metric === 'revenue' ? 'fs.payment_value_allocated' : 'fs.item_price';

  const whereClauses: string[] = [];
  const params: any[] = [];

  whereClauses.push(`dd.full_date >= $${params.length + 1}::timestamp`);
  params.push(startDate);
  whereClauses.push(`dd.full_date <= $${params.length + 1}::timestamp`);
  params.push(endDate);

  if (orderStatus) {
    whereClauses.push(`o.order_status = $${params.length + 1}`);
    params.push(orderStatus);
  }
  if (productCategory) {
    whereClauses.push(`dp.product_category = $${params.length + 1}`);
    params.push(productCategory);
  }

  const filter = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const query = `
    SELECT 
      dp.product_id,
      dp.product_category,
      SUM(${metricColumn})::float AS value
    FROM dwh.fact_sales fs
    JOIN dwh.dim_order o ON fs.order_key = o.order_key
    JOIN dwh.dim_product dp ON fs.product_key = dp.product_key
    JOIN dwh.dim_date dd ON fs.date_key = dd.date_key
    ${filter}
    GROUP BY dp.product_id, dp.product_category
    ORDER BY value DESC
    LIMIT $${params.length + 1};
  `;
  params.push(limit);

  const result = await this.prisma.$queryRawUnsafe(query, ...params) as any[];
return result.map((row: any) => ({
  product_id: row.product_id,
  product_category: row.product_category,
  value: Number(row.value),
}));
}

async getProductCategories(): Promise<string[]> {
  const result = await this.prisma.$queryRaw<Array<{ category: string }>>`
    SELECT DISTINCT product_category AS category
    FROM dwh.dim_product
    ORDER BY category;
  `;
  // return result.map((row: any) => ({...}));
  return result.map((row: { category: string }) => row.category);

  // en caso de que falle
  // const result = await this.prisma.$queryRawUnsafe(`SELECT DISTINCT product_category AS category FROM dwh.dim_product ORDER BY category`) as any[];
// return result.map((row: any) => row.category);
}
}