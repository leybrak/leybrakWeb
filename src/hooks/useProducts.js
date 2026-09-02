import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Trae productos/proyectos públicos para pintarlos en la web.
// `type` es opcional: 'producto' | 'proyecto'
export const useProducts = (type) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const qs  = type ? `?type=${type}` : '';
      const res = await fetch(`${API_URL}/api/products${qs}`);
      const data = await res.json();
      if (res.ok && data.ok) setProducts(data.data);
    } catch {
      // Si falla, se queda la lista vacía — los componentes deben manejarlo
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { (async () => { await fetchProducts(); })(); }, [fetchProducts]);

  return { products, loading, refresh: fetchProducts };
};
