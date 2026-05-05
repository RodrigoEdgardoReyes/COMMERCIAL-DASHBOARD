'use client';

import { useState, useEffect, useCallback } from 'react';
import RankingsTable from './RankingsTable';

interface RankingsProps {
  from: string;
  to: string;
  orderStatus: string;
  productCategory: string;
}

// Componente para mostrar el ranking de productos según la métrica seleccionada (GMV o Revenue). Se encarga de cargar los datos desde el backend según los filtros aplicados y la métrica seleccionada, y muestra el resultado en una tabla ordenada por posición. Si no hay datos, muestra un mensaje indicándolo.
export default function RankingsView({ from, to, orderStatus, productCategory }: RankingsProps) {
  const [metric, setMetric] = useState<'gmv' | 'revenue'>('gmv');
  const [limit] = useState(10);
  const [rankings, setRankings] = useState<ProductRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ from, to, metric, limit: limit.toString() });
      if (orderStatus) params.append('order_status', orderStatus);
      if (productCategory) params.append('product_category', productCategory);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rankings/products?${params}`);
      if (!res.ok) throw new Error('Error al obtener rankings');
      const data: ProductRank[] = await res.json();
      setRankings(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [from, to, orderStatus, productCategory, metric, limit]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  return (
    <div>
      <div className="flex gap-4 mb-4 text-black">
        <button
          className={`px-4 py-2 rounded ${metric === 'gmv' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setMetric('gmv')}
        >
          Por GMV
        </button>
        <button
          className={`px-4 py-2 rounded ${metric === 'revenue' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setMetric('revenue')}
        >
          Por Revenue
        </button>
      </div>
      {loading && <p className='text-green-500'>Cargando rankings...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && <RankingsTable data={rankings} metric={metric} />}
    </div>
  );
}