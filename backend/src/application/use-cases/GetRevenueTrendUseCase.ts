import type { TrendPoint } from '../../domain/entities/TrendPoint.js';
import type { SaleRepository } from '../../domain/ports/SaleRepository.js';

  export class GetRevenueTrendUseCase {
  constructor(private saleRepository: SaleRepository) {}

  // Recibe un rango de fechas, el nivel de granularidad (día, semana, mes) y filtros opcionales, y devuelve la tendencia de ingresos.
  async execute(startDate: Date, endDate: Date, grain: string = 'day', orderStatus?: string, productCategory?: string): Promise<TrendPoint[]> {
    if (!['day', 'week', 'month'].includes(grain)) {
      throw new Error('Invalid grain. Allowed: day, week, month');
    }
    // Llama al repositorio para obtener la tendencia de ingresos según los parámetros recibidos.
    return this.saleRepository.getRevenueTrend(startDate, endDate, grain, orderStatus, productCategory);
  }
}