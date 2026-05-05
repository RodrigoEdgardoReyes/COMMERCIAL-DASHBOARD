const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Declara una función asíncrona para obtener KPIs desde el backend. Recibe dos parámetros: from y to, que representan el rango de fechas.
export async function fetchKPIs(from: string, to: string) {
  // Realiza una petición HTTP GET al endpoint /kpis con los parámetros de fecha.
  const res = await fetch(`${API_BASE_URL}/kpis?from=${from}&to=${to}`);
  
  // Verifica si la respuesta no fue exitosa. Si el estado HTTP no es correcto, lanza un error.
  if (!res.ok) {
    throw new Error('Failed to fetch KPIs');
  }

  // Convierte la respuesta en formato JSON y la devuelve.
  return res.json();
}