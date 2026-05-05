// Importa el repositorio y la interfaz KPIs.
import type { SaleRepository } from '../../domain/ports/SaleRepository.ts';
import type { KPIs } from '../../domain/entities/KPIs.ts';

// Caso de uso: Obtener KPIs.
// Esta clase orquesta la lógica de negocio y depende solo de la interfaz SaleRepository.
export class GetKPIsUseCase {
  constructor(private saleRepository: SaleRepository) {}
  
  // Recibe un rango de fechas y filtros opcionales, y devuelve los KPIs calculados.
  async execute(startDate: Date, endDate: Date, orderStatus?: string, productCategory?: string): Promise<KPIs> {
    return this.saleRepository.getKPIs(startDate, endDate, orderStatus, productCategory);
  }
}