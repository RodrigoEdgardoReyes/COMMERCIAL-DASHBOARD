"use client";

import { useState, useEffect } from "react";

interface CategorySelectProps {
  value: string;
  onChange: (category: string) => void;
}

export default function CategorySelect({ value, onChange }: CategorySelectProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
        );
        if (!res.ok) throw new Error("Error al cargar categorías");
        const data: unknown = await res.json();
        // Guardamos el array tal cual, aunque tenga nulls
        if (Array.isArray(data)) {
          setCategories(data as string[]);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded px-3 py-2 w-full"
      disabled={loading}
    >
      <option value="">Todas las categorías</option>
      {categories
        .filter((cat): cat is string => cat !== null && cat !== undefined)
        .map((cat) => (
          <option key={cat} value={cat}>
            {cat.replace(/_/g, " ")}
          </option>
        ))}
    </select>
  );
}