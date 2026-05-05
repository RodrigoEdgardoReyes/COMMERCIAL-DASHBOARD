// components/TrendChart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface TrendChartProps {
  data: TrendPoint[];
  className?: string;
}

// Componente para mostrar la tendencia de revenue y órdenes a lo largo del tiempo. Utiliza Recharts para renderizar un gráfico de líneas con dos ejes Y (uno para revenue y otro para órdenes) y un eje X para las fechas. Recibe los datos ya formateados desde el componente padre y los muestra en el gráfico. Permite personalizar estilos a través de la prop className.
export default function TrendChart({ data, className }: TrendChartProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Tendencia de Revenue y Órdenes</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue ($)" />
          <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" name="Órdenes" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}