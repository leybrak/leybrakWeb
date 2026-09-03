import { useState } from 'react';

// ─── Cambia esto por la URL real cuando tengas el VPS ────────────────────────
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useLead = () => {
  const [status,   setStatus]   = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async ({ nombre, telefono, servicio = 'general', origen = 'formulario', mensaje = '' }) => {
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nombre, telefono, servicio, origen, mensaje }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Error al enviar. Intenta por WhatsApp.');
      }

      setStatus('success');
      return data;

    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
      throw err;
    }
  };

  const reset = () => { setStatus('idle'); setErrorMsg(''); };

  return { submit, status, errorMsg, reset };
};