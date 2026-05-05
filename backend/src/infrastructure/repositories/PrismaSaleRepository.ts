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

// Interfaz para la fila cruda devuelta por la consulta de productos
interface RawProductRow {
  product_id: string;
  product_category: string;
  metric: string;   
}

export class PrismaSaleRepository implements SaleRepository {
  constructor(private prisma: PrismaClient) {}

  // Implementación del método para obtener KPIs, con construcción dinámica de la consulta SQL según los filtros recibidos.
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

  // Ejecutamos la consulta y parseamos el resultado a número, manejando posibles nulls o strings vacíos.
  const revenueResult = await this.prisma.$queryRawUnsafe(revenueQuery, ...params) as Array<{ revenue: number }>;
  
  // Si el resultado es null o no tiene la propiedad revenue, se asigna 0 por defecto.
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

// Implementación del método para obtener la tendencia de ingresos, con construcción dinámica de la consulta SQL según los filtros recibidos.
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

  // Ejecutamos la consulta y mapeamos el resultado a la estructura TrendPoint, asegurando convertir los valores a número.
  const result = await this.prisma.$queryRawUnsafe(query, ...params) as any[];

// Luego el mapeo
return result.map((row: any) => ({
  date: row.date,
  revenue: Number(row.revenue),
  orders: Number(row.orders),
}));
}

// Implementación del método para obtener el ranking de productos, con construcción dinámica de la consulta SQL según los filtros recibidos.
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

  // Mapeamos el resultado para devolver solo un array de strings con las categorías.
  return result.map((row: { category: string }) => row.category);
}
}