import type { TrendPoint } from '../../domain/entities/TrendPoint.js';
import type { SaleRepository } from '../../domain/ports/SaleRepository.js';

  export class GetRevenueTrendUseCase {
  constructor(private saleRepository: SaleRepository) {}

  async execute(startDate: Date, endDate: Date, grain: string = 'day', orderStatus?: string, productCategory?: string): Promise<TrendPoint[]> {
    if (!['day', 'week', 'month'].includes(grain)) {
      throw new Error('Invalid grain. Allowed: day, week, month');
    }
    return this.saleRepository.getRevenueTrend(startDate, endDate, grain, orderStatus, productCategory);
  }
}