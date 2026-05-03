import type { SaleRepository } from "../../domain/ports/SaleRepository.js";

export class GetCategoriesUseCase {
  constructor(private saleRepository: SaleRepository) {}
  async execute(): Promise<string[]> {
    return this.saleRepository.getProductCategories();
  }
}