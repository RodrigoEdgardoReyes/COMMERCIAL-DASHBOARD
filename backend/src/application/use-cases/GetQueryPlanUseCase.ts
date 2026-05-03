import type { IDebugRepository } from '../../domain/ports/IDebugRepository.js';

export class GetQueryPlanUseCase {
  constructor(private debugRepo: IDebugRepository) {}
  async execute(query: string, params: any[]) {
    return this.debugRepo.getQueryPlan(query, params);
  }
}