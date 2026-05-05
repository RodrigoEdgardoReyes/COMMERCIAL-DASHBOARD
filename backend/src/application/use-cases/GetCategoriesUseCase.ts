import type { SaleRepository } from "../../domain/ports/SaleRepository.js";

export class GetCategoriesUseCase {
  constructor(private saleRepository: SaleRepository) {}
  // Devuelve la lista de categorías disponibles.
  async execute(): Promise<string[]> {
    return this.saleRepository.getProductCategories();
  }
}