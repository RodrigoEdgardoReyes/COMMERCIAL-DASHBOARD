'use client';

import CategorySelect from './CategorySelect';

interface FilterBarProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  orderStatus: string;
  onOrderStatusChange: (value: string) => void;
  productCategory: string;
  onProductCategoryChange: (value: string) => void;
}

const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'canceled', label: 'Cancelado' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'processing', label: 'Procesando' },
  // Añade otros si existen en tu dataset
];

export default function FilterBar({
  from, to, onFromChange, onToChange,
  orderStatus, onOrderStatusChange,
  productCategory, onProductCategoryChange
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 text-black rounded shadow">
      <div>
        <label className="block text-sm font-medium">Desde</label>
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Hasta</label>
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Estado de la orden</label>
        <select
          value={orderStatus}
          onChange={(e) => onOrderStatusChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          {ORDER_STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Categoría del producto</label>
        <CategorySelect value={productCategory} onChange={onProductCategoryChange} />
      </div>
    </div>
  );
}