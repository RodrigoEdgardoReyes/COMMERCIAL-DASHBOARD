// components/FilterBar.tsx
'use client';

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

export default function FilterBar({
  from, to, onFromChange, onToChange,
  orderStatus, onOrderStatusChange,
  productCategory, onProductCategoryChange
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow">
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">Desde</label>
        <input
          type="date"
          className="border border-gray-300 rounded px-3 py-2 text-black text-sm"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">Hasta</label>
        <input
          type="date"
          className="border border-gray-300 rounded px-3 py-2 text-black text-sm"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">Estado de la orden</label>
        <select
          className="border border-gray-300 rounded px-3 py-2 text-black text-sm"
          value={orderStatus}
          onChange={(e) => onOrderStatusChange(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="delivered">Entregado</option>
          <option value="canceled">Cancelado</option>
          <option value="shipped">Enviado</option>
          {/* Agrega más según el dataset */}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">Categoría del producto</label>
        <input
          type="text"
          placeholder="ej. informatica_acessorios"
          className="border border-gray-300 rounded px-3 py-2 text-black text-sm"
          value={productCategory}
          onChange={(e) => onProductCategoryChange(e.target.value)}
        />
        {/* Podría ser un select, pero requeriría cargar las categorías disponibles */}
      </div>
    </div>
  );
}