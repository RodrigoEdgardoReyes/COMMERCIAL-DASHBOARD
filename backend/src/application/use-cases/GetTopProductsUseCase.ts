import type { SaleRepository } from '../../domain/ports/SaleRepository.js';
import type { ProductRanking } from '../../domain/entities/ProductRanking.js';

export class GetTopProductsUseCase {
  constructor(private saleRepository: SaleRepository) {}

  // Recibe un rango de fechas, la métrica a ordenar (gmv o revenue), el número de productos a devolver, y filtros opcionales, y devuelve el ranking de productos.
  async execute(startDate: Date, endDate: Date, metric: string = 'gmv', limit: number = 10, orderStatus?: string, productCategory?: string): Promise<ProductRanking[]> {
    // Validaciones básicas de los parámetros de entrada.
    if (!['gmv', 'revenue'].includes(metric)) throw new Error('Invalid metric. Allowed: gmv, revenue');

    // El límite máximo se establece en 50 para evitar consultas demasiado pesadas.
    if (limit < 1 || limit > 50) throw new Error('Limit must be between 1 and 50');

    // Llama al repositorio para obtener el ranking de productos según los parámetros recibidos.
    return this.saleRepository.getTopProducts(startDate, endDate, metric, limit, orderStatus, productCategory);
  }
}