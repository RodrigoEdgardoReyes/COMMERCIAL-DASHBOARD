export interface IDebugRepository {
//   Método para obtener el ranking de productos en un rango de fechas, según una métrica (GMV o Revenue), con un límite de resultados y filtros opcionales.
//   getTopProducts(startDate: Date, endDate: Date, metric: string, limit: number, filters?: any): Promise<any[]>;

//   Método para obtener las categorías de productos disponibles (para filtros).
//   getProductCategory(): Promise<string[]>;
  getQueryPlan(query: string, params: any[]): Promise<any>;
}