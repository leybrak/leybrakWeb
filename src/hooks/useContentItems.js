import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Lee listas simples con forma { id, title, description, sortOrder } —
// usado por /api/services y /api/about-values.
export const useContentItems = (apiPath) => {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}${apiPath}`);
      const data = await res.json();
      if (res.ok && data.ok) setItems(data.data);
    } catch {
      // Si falla, se queda la lista vacía
    } finally {
      setLoading(false);
    }
  }, [apiPath]);

  useEffect(() => { (async () => { await fetchItems(); })(); }, [fetchItems]);

  return { items, loading, refresh: fetchItems };
};
