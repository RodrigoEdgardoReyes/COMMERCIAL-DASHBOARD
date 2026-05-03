interface RankingsTableProps {
  data: ProductRank[];
  metric: 'gmv' | 'revenue';
}

export default function RankingsTable({ data, metric }: RankingsTableProps) {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">No hay productos para mostrar.</p>;
  }

  return (
    <div className="overflow-x-auto text-black">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Posición</th>
            <th className="px-4 py-2 text-left">Producto</th>
            <th className="px-4 py-2 text-right">{metric === 'gmv' ? 'GMV' : 'Revenue'}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.product_id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{item.product_name || item.product_id}</td>
              <td className="px-4 py-2 text-right">
                {item.value !== undefined && item.value !== null
                  ? `$${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}