import { PrismaClient } from '../../../generated/prisma/client.js';
import type { IDebugRepository } from '../../domain/ports/IDebugRepository.js';

export class DebugRepository implements IDebugRepository {
  constructor(private prisma: PrismaClient) {}

  // Recibe una consulta SQL y sus parámetros, y devuelve el plan de ejecución de la consulta.
  async getQueryPlan(query: string, params: any[]): Promise<any> {
    const explainQuery = `EXPLAIN ANALYZE ${query}`;
    return this.prisma.$queryRawUnsafe(explainQuery, ...params);
  }
}