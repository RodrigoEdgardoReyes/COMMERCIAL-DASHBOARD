'use client';

import { useState } from 'react';
import DashboardView from '@/components/DashboardView';
import RankingsView from '@/components/RankingsView';
import FilterBar from '@/components/FilterBar';
import DebugView from '@/components/DebugView';

export default function HomePage() {
  const [from, setFrom] = useState('2016-01-01');
  const [to, setTo] = useState('2018-12-31');
  const [orderStatus, setOrderStatus] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'rankings' | 'debug'>('overview');

  return (
    <main className="min-h-screen bg-gray-300 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-center text-black mb-6">Dashboard Comercial Olist</h1>

      {/* Filtros globales */}
      <FilterBar
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        orderStatus={orderStatus}
        onOrderStatusChange={setOrderStatus}
        productCategory={productCategory}
        onProductCategoryChange={setProductCategory}
      />

      {/* Pestañas de navegación */}
      <div className="flex gap-2 mt-6 mb-8 border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'overview'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'rankings'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('rankings')}
        >
          Rankings de Productos
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'debug'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('debug')}
        >
          Debug
        </button>
      </div>

      {/* Contenido dinámico */}
      {activeTab === 'overview' && (
        <DashboardView
          from={from}
          to={to}
          orderStatus={orderStatus}
          productCategory={productCategory}
        />
      )}
      {activeTab === 'rankings' && (
        <RankingsView
          from={from}
          to={to}
          orderStatus={orderStatus}
          productCategory={productCategory}
        />
      )}
      {activeTab === 'debug' && (
        <DebugView />
      )}
    </main>
  );
}