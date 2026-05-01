// Definición de la interfaz KPIs que representa las métricas clave del negocio.
// Esta interfaz es el contrato de datos que se usará en todas las capas.
export interface KPIs {
  gmv: number;          // Gross Merchandise Value: suma de item_price
  revenue: number;      // Ingresos totales (ej. suma de payment_value_allocated)
  orders: number;       // Número de órdenes en el rango de fechas
  aov: number;          // Average Order Value = revenue / orders
  ipo: number;          // Items per Order = total items / total orders
  cancelRate: number;   // % de órdenes canceladas
  onTimeRate: number;   // % de órdenes entregadas a tiempo
}
