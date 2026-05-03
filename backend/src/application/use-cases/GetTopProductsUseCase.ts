import type { SaleRepository } from '../../domain/ports/SaleRepository.js';
import type { ProductRanking } from '../../domain/entities/ProductRanking.js';

export class GetTopProductsUseCase {
  constructor(private saleRepository: SaleRepository) {}

  async execute(startDate: Date, endDate: Date, metric: string = 'gmv', limit: number = 10, orderStatus?: string, productCategory?: string): Promise<ProductRanking[]> {
    if (!['gmv', 'revenue'].includes(metric)) throw new Error('Invalid metric. Allowed: gmv, revenue');
    if (limit < 1 || limit > 50) throw new Error('Limit must be between 1 and 50');
    return this.saleRepository.getTopProducts(startDate, endDate, metric, limit, orderStatus, productCategory);
  }
}
  // async execute(startDate: Date, endDate: Date, metric: string = 'gmv', limit: number = 10): Promise<ProductRanking[]> {
  //   if (!['gmv', 'revenue'].includes(metric)) {
  //     throw new Error('Invalid metric. Allowed: gmv, revenue');
  //   }
  //   if (limit < 1 || limit > 50) {
  //     throw new Error('Limit must be between 1 and 50');
  //   }
  //   return this.saleRepository.getTopProducts(startDate, endDate, metric, limit);
  // }
