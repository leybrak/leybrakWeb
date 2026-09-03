import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const LIMIT = 20;

const ESTADOS = ['nuevo', 'contactado', 'cerrado'];

const ESTADO_STYLES = {
  nuevo:      'bg-leybrak-blue text-white',
  contactado: 'bg-amber-500 text-white',
  cerrado:    'bg-gray-400 dark:bg-gray-600 text-white',
};

const SERVICIO_LABELS = {
  saas:        'SaaS Gastronómico',
  custom:      'A medida',
  data_vision: 'Inteligencia de Negocio',
  general:     'General',
  portafolio:  'Portafolio',
  '':          '—',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Panel de "Leads" — mensajes que llegan de todos los formularios de la web
// (Inicio, Servicios, A medida, Portafolio) y del botón de WhatsApp. Cada
// lead se puede marcar como nuevo / contactado / cerrado desde acá.
const LeadsPanel = () => {
  const { authFetch } = useAuth();

  const [leads, setLeads]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [offset, setOffset]   = useState(0);
  const [estadoFilter, setEstadoFilter]   = useState('');
  const [servicioFilter, setServicioFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: LIMIT, offset });
      if (estadoFilter)   params.set('estado', estadoFilter);
      if (servicioFilter) params.set('servicio', servicioFilter);
      const res = await authFetch(`/api/leads?${params.toString()}`);
      setLeads(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch, offset, estadoFilter, servicioFilter]);

  useEffect(() => { (async () => { await fetchLeads(); })(); }, [fetchLeads]);

  // Cualquier cambio de filtro vuelve a la primera página
  const applyFilter = (setter) => (value) => { setter(value); setOffset(0); };

  const changeEstado = async (lead, estado) => {
    setUpdatingId(lead.id);
    try {
      await authFetch(`/api/leads/${lead.id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) });
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, estado } : l));
    } catch (err) {
      window.alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const page      = Math.floor(offset / LIMIT) + 1;
  const pageCount = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-black uppercase text-gray-900 dark:text-white">Leads — mensajes recibidos</h2>

        <div className="flex gap-3">
          <select
            value={estadoFilter}
            onChange={e => applyFilter(setEstadoFilter)(e.target.value)}
            className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2 text-[12px] font-mono outline-none uppercase"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>

          <select
            value={servicioFilter}
            onChange={e => applyFilter(setServicioFilter)(e.target.value)}
            className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2 text-[12px] font-mono outline-none"
          >
            <option value="">Todos los servicios</option>
            {Object.entries(SERVICIO_LABELS).filter(([k]) => k).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-red-500 text-[12px] font-mono">{error}</p>}

      <div className="border-2 border-gray-900 dark:border-white bg-white dark:bg-[#0f0f12] overflow-x-auto">
        {loading ? (
          <p className="p-6 text-gray-500 font-mono text-[13px]">Cargando...</p>
        ) : leads.length === 0 ? (
          <p className="p-6 text-gray-500 font-mono text-[13px]">Todavía no hay leads con estos filtros.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-900 dark:border-white text-[10px] font-mono uppercase tracking-widest text-gray-500">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Servicio</th>
                <th className="px-4 py-3">Mensaje</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-200 dark:border-white/10 text-[13px] text-gray-900 dark:text-white align-top">
                  <td className="px-4 py-3 font-mono text-gray-500 whitespace-nowrap">{formatDate(lead.created_at)}</td>
                  <td className="px-4 py-3 font-bold whitespace-nowrap">{lead.nombre}</td>
                  <td className="px-4 py-3 font-mono whitespace-nowrap">
                    <a
                      href={`https://wa.me/${lead.telefono.replace(/[^\d]/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-leybrak-blue hover:underline"
                    >
                      <MessageCircle size={13} /> {lead.telefono}
                    </a>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-500 whitespace-nowrap">
                    {SERVICIO_LABELS[lead.servicio] ?? lead.servicio}
                    <span className="block text-[10px] text-gray-400 normal-case">{lead.origen}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs">
                    {lead.mensaje || <span className="text-gray-300 dark:text-gray-700">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={lead.estado}
                      onChange={e => changeEstado(lead, e.target.value)}
                      disabled={updatingId === lead.id}
                      className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 border-0 outline-none cursor-pointer disabled:opacity-50 ${ESTADO_STYLES[lead.estado] || 'bg-gray-400 text-white'}`}
                    >
                      {ESTADOS.map(e => <option key={e} value={e} className="bg-white text-gray-900">{e}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > LIMIT && (
        <div className="flex items-center justify-between font-mono text-[12px] text-gray-500">
          <span>Página {page} de {pageCount} — {total} lead{total === 1 ? '' : 's'} en total</span>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - LIMIT))}
              disabled={offset === 0}
              className="flex items-center gap-1 border-2 border-gray-300 dark:border-white/20 px-3 py-2 uppercase tracking-widest text-[11px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={13} /> Anterior
            </button>
            <button
              onClick={() => setOffset(offset + LIMIT)}
              disabled={offset + LIMIT >= total}
              className="flex items-center gap-1 border-2 border-gray-300 dark:border-white/20 px-3 py-2 uppercase tracking-widest text-[11px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsPanel;
