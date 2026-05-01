// Importa el repositorio y la interfaz KPIs.
import type { SaleRepository } from '../../domain/ports/SaleRepository.ts';
import type { KPIs } from '../../domain/entities/KPIs.ts';

// Caso de uso: Obtener KPIs.
// Esta clase orquesta la lógica de negocio y depende solo de la interfaz SaleRepository.
export class GetKPIsUseCase {
  constructor(private saleRepository: SaleRepository) {}

  // Método principal que ejecuta el caso de uso.
  async execute(startDate: Date, endDate: Date): Promise<KPIs> {
    // Se llama al repositorio para obtener los datos desde fact_sales.
    const rawData = await this.saleRepository.getKPIs(startDate, endDate);

    // Aca se podria aplicar lógica adicional (ej. calcular AOV).

    // Retornar los KPIs al controlador.
    return rawData;
  }
}
