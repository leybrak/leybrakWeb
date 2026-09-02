import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Trae los planes de precio de un producto específico.
export const usePlans = (productId) => {
  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    if (!productId) { setPlans([]); setLoading(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/plans?productId=${productId}`);
      const data = await res.json();
      if (res.ok && data.ok) setPlans(data.data);
    } catch {
      // Si falla, se queda la lista vacía
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { (async () => { await fetchPlans(); })(); }, [fetchPlans]);

  return { plans, loading, refresh: fetchPlans };
};
