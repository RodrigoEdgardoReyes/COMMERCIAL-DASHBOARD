export interface IDebugRepository {
  // Recibe una consulta SQL y sus parámetros, y devuelve el plan de ejecución de la consulta.
  getQueryPlan(query: string, params: any[]): Promise<any>;
}