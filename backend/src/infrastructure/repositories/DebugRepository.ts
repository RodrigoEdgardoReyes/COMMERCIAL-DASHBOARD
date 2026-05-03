import { PrismaClient } from '../../../generated/prisma/client.js';
import type { IDebugRepository } from '../../domain/ports/IDebugRepository.js';

export class DebugRepository implements IDebugRepository {
  constructor(private prisma: PrismaClient) {}

  async getQueryPlan(query: string, params: any[]): Promise<any> {
    const explainQuery = `EXPLAIN ANALYZE ${query}`;
    return this.prisma.$queryRawUnsafe(explainQuery, ...params);
  }
}