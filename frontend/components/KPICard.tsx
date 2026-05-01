interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  format?: 'number' | 'decimal' | 'percent' | 'currency';
}

export default function KPICard({ title, value, prefix = '', format = 'currency' }: KPICardProps) {
  const formattedValue = () => {
    if (format === 'percent') return `${(value * 100).toFixed(2)}%`;
    if (format === 'decimal') return value.toFixed(2);
    if (format === 'number') return Math.round(value).toLocaleString();
    return `${prefix}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{formattedValue()}</p>
    </div>
  );
}