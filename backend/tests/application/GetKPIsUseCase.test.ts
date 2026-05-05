import { jest } from '@jest/globals';
import { GetKPIsUseCase } from '../../src/application/use-cases/GetKPIsUseCase.js';
import type { SaleRepository } from '../../src/domain/ports/SaleRepository.js';
import type { KPIs } from '../../src/domain/entities/KPIs.js';


describe('GetKPIsUseCase', () => {
    it('should call repository with correct dates', async () => {
        // Mock del repositorio con tipos explícitos
        const mockRepo: SaleRepository = {
          getKPIs: jest.fn<SaleRepository['getKPIs']>(),
          getRevenueTrend: jest.fn<SaleRepository['getRevenueTrend']>(),
          getTopProducts: jest.fn<SaleRepository['getTopProducts']>(),
          getProductCategories: jest.fn<SaleRepository['getProductCategories']>(),
        };
        
    // Instanciamos el caso de uso con el repositorio mockeado
    const useCase = new GetKPIsUseCase(mockRepo);
    const expected: KPIs = {
      gmv: 100, revenue: 90, orders: 2, aov: 45,
      ipo: 1, cancelRate: 0, onTimeRate: 1
    };

    // Configurar el valor de retorno usando jest.mocked
    jest.mocked(mockRepo.getKPIs).mockResolvedValue(expected);

    const from = new Date('2022-01-01');
    const to = new Date('2022-01-31');
    const result = await useCase.execute(from, to);

    // Verificar llamada y resultado
    expect(jest.mocked(mockRepo.getKPIs)).toHaveBeenCalledWith(from, to, undefined, undefined);
    expect(result).toEqual(expected);
  });

});