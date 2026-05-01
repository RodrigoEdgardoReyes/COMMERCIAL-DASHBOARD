interface RankingsTableProps {
  data: ProductRank[];
  metric: 'gmv' | 'revenue';
}

export default function RankingsTable({ data, metric }: RankingsTableProps) {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">No hay productos para mostrar.</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow text-black overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posición</th>
            <th className="px-4 py-2 text-left">Producto</th>
            <th className="px-4 py-2 text-right">{metric === 'gmv' ? 'GMV' : 'Revenue'}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            // Obtén el valor correcto según la métrica activa
            const value = metric === 'gmv' ? item.gmv : item.revenue;

            return (
              <tr key={item.product_id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.product_name || item.product_id}</td>
                <td className="px-4 py-2 text-right">
                  {value != null
                    ? `$${Number(value).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
