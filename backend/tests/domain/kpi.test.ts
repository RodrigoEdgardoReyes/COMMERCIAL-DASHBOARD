import type { KPIs } from '../../src/domain/entities/KPIs.js';

// Test para la entidad KPIs, que es un simple DTO sin lógica, pero se verifica de que se pueda crear correctamente con los datos esperados.
describe('KPIs entity', () => {
  it('should allow creation with valid data', () => {
    const kpis: KPIs = {
      gmv: 1000,
      revenue: 900,
      orders: 5,
      aov: 180,
      ipo: 2,
      cancelRate: 0.1,
      onTimeRate: 0.95,
    };
    expect(kpis.gmv).toBe(1000);
    expect(kpis.revenue).toBe(900);
    expect(kpis.orders).toBe(5);
    expect(kpis.aov).toBe(180);
    expect(kpis.ipo).toBe(2);
    expect(kpis.cancelRate).toBe(0.1);
    expect(kpis.onTimeRate).toBe(0.95);
  });
});