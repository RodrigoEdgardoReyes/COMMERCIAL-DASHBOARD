// Importamos la interfaz KPIs para usarla en el contrato del repositorio.
import type { KPIs } from '../entities/KPIs.ts';
import type { ProductRanking } from '../entities/ProductRanking.js';
import type { TrendPoint } from '../entities/TrendPoint.js';

// Cualquier implementación (ej. PrismaSaleRepository) debe cumplir este contrato.
export interface SaleRepository {
  // Método para obtener KPIs en un rango de fechas con filtros opcionales.
  getKPIs(startDate: Date, endDate: Date, orderStatus?: string, productCategory?: string): Promise<KPIs>;

  // Método para obtener la tendencia de ingresos en un rango de fechas, con una granularidad y filtros opcionales. 
  getRevenueTrend(startDate: Date, endDate: Date, grain: string, orderStatus?: string, productCategory?: string): Promise<TrendPoint[]>;

  // Método para obtener el ranking de productos en un rango de fechas, según una métrica (GMV o Revenue), con un límite de resultados y filtros opcionales.
  getTopProducts(startDate: Date, endDate: Date, metric: string, limit: number, orderStatus?: string, productCategory?: string): Promise<ProductRanking[]>;

  // Método para obtener las categorías de productos disponibles (para filtros).
  getProductCategories(): Promise<string[]>;
}
