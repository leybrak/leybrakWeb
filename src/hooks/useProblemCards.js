import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Tarjetas de "¿Te suena familiar?" de Inicio — forma (quote, context, who).
export const useProblemCards = () => {
  const [cards, setCards]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/problem-cards`);
      const data = await res.json();
      if (res.ok && data.ok) setCards(data.data);
    } catch {
      // Si falla, se queda la lista vacía
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { (async () => { await fetchCards(); })(); }, [fetchCards]);

  return { cards, loading, refresh: fetchCards };
};
