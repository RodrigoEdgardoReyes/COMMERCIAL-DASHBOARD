import type { IDebugRepository } from '../../domain/ports/IDebugRepository.js';

export class GetQueryPlanUseCase {
  constructor(private debugRepo: IDebugRepository) {}
  // Ejecuta el caso de uso para obtener el plan de ejecución de una consulta SQL.
  async execute(query: string, params: any[]) {
    return this.debugRepo.getQueryPlan(query, params);
  }
}