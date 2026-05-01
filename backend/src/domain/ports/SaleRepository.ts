// Importamos la interfaz KPIs para usarla en el contrato del repositorio.
import type { KPIs } from '../entities/KPIs.ts';
import type { ProductRanking } from '../entities/ProductRanking.js';
import type { TrendPoint } from '../entities/TrendPoint.js';

// Definición de la interfaz SaleRepository.
// Cualquier implementación (ej. PrismaSaleRepository) debe cumplir este contrato.
export interface SaleRepository {
  // Método para obtener KPIs en un rango de fechas con filtros opcionales.
  getKPIs(startDate: Date, endDate: Date, filters?: any): Promise<KPIs>;

  // Método para obtener la tendencia de ingresos en un rango de fechas, con una granularidad y filtros opcionales. 
  getRevenueTrend(startDate: Date, endDate: Date, grain: string, filters?: any): Promise<TrendPoint[]>;

  // Método para obtener el ranking de productos en un rango de fechas, según una métrica (GMV o Revenue), con un límite de resultados y filtros opcionales.
  getTopProducts(startDate: Date, endDate: Date, metric: string, limit: number, filters?: any): Promise<ProductRanking[]>;
}
