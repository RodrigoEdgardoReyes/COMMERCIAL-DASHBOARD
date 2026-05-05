'use client';

import { useState } from 'react';

interface QueryPlanResult {
  query: string;
  plan: { 'QUERY PLAN': string }[];
}

// Componente para mostrar el plan de ejecución de consultas SQL. Permite seleccionar entre diferentes consultas predefinidas (KPIs, rankings, trend) y muestra el resultado formateado.
export default function DebugView() {
  const [plan, setPlan] = useState<QueryPlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = async (queryName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/debug/query-plan?query=${queryName}`
      );
      if (!res.ok) throw new Error('Error al obtener el plan');
      const data: QueryPlanResult = await res.json();
      setPlan(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl text-gray-800 font-semibold mb-4">Query Plan Debug</h2>
      <p className="text-gray-600 mb-4">
        Seleccione una consulta para ver su plan de ejecución (EXPLAIN ANALYZE).
      </p>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => fetchPlan('kpis')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800"
        >
          KPIs
        </button>
        <button
          onClick={() => fetchPlan('rankings')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Rankings
        </button>
        <button
          onClick={() => fetchPlan('trend')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Trend
        </button>
      </div>

      {loading && <p className="text-gray-500">Cargando plan de ejecución…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {plan && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
          <pre className="text-sm whitespace-pre-wrap">
            {plan.plan.map((line, i) => line['QUERY PLAN']).join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
}