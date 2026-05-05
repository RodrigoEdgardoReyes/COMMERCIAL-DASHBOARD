"use client";

import { useState, useEffect, useCallback } from "react";
import KPICard from "./KPICard";
import TrendChart from "./TrendChart";

interface KPI {
  gmv: number;
  revenue: number;
  orders: number;
  aov: number;
  ipo: number;
  cancelRate: number;
  onTimeRate: number;
}

interface TrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface DashboardProps {
  from: string;
  to: string;
  orderStatus: string;
  productCategory: string;
}

// Componente principal del dashboard que muestra los KPIs y la tendencia de revenue. Se encarga de cargar los datos desde el backend según los filtros aplicados.
export default function DashboardView({
  from,
  to,
  orderStatus,
  productCategory,
}: DashboardProps) {
  const [kpis, setKpis] = useState<KPI | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ from, to });
      if (orderStatus) params.append("order_status", orderStatus);
      if (productCategory) params.append("product_category", productCategory);

      const [kpiRes, trendRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kpis?${params}`),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/trend/revenue?${params}&grain=day`,
        ),
      ]);

      if (!kpiRes.ok || !trendRes.ok)
        throw new Error("Error al obtener datos del servidor");

      const kpiData: KPI = await kpiRes.json();
      const trendData: TrendPoint[] = await trendRes.json();

      setKpis(kpiData);
      setTrend(trendData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [from, to, orderStatus, productCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      {loading && <p className="text-center text-blue-600 mt-10">Cargando indicadores...</p>}
      {error && <p className="text-red-600 text-center mt-8">Error: {error}</p>}

      {!loading && !error && kpis && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-400 mt-6">
            <KPICard title="GMV" value={kpis.gmv} prefix="$" />
            <KPICard title="Revenue" value={kpis.revenue} prefix="$" />
            <KPICard title="Órdenes" value={kpis.orders} format="number" />
            <KPICard title="AOV" value={kpis.aov} prefix="$" />
            <KPICard title="Items/Orden" value={kpis.ipo} format="decimal" />
            <KPICard
              title="Cancelación"
              value={kpis.cancelRate}
              format="percent"
            />
            <KPICard
              title="Entrega a tiempo"
              value={kpis.onTimeRate}
              format="percent"
            />
          </div>
          <TrendChart data={trend} className="mt-8" />
        </>
      )}
    </div>
  );
}
