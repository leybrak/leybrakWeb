import { useState } from 'react';
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useContentItems } from '../../hooks/useContentItems';

const EMPTY_FORM = { label: '', value: '' };

// Métricas rápidas del hero del portafolio (ej. "Especialidad — Metodología
// Kimball") — solo se muestran en /portafolio si hay al menos una cargada.
const FounderMetricsPanel = () => {
  const { authFetch } = useAuth();
  const { items: metrics, loading, refresh } = useContentItems('/api/founder-metrics');

  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [reordering, setReordering] = useState(false);

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId('new'); setError(''); };
  const openEdit = (m) => { setForm({ label: m.label, value: m.value || '' }); setEditingId(m.id); setError(''); };
  const closeForm = () => { setEditingId(null); setError(''); };
  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId === 'new') {
        const nextOrder = metrics.length > 0 ? Math.max(...metrics.map(m => m.sortOrder ?? 0)) + 1 : 1;
        await authFetch('/api/founder-metrics', { method: 'POST', body: JSON.stringify({ ...form, sortOrder: nextOrder }) });
      } else {
        const current = metrics.find(m => m.id === editingId);
        await authFetch(`/api/founder-metrics/${editingId}`, { method: 'PUT', body: JSON.stringify({ ...form, sortOrder: current?.sortOrder ?? 0 }) });
      }
      await refresh();
      closeForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m) => {
    if (!window.confirm(`¿Eliminar "${m.label}"?`)) return;
    try {
      await authFetch(`/api/founder-metrics/${m.id}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      window.alert(err.message);
    }
  };

  const move = async (index, direction) => {
    const otherIndex = index + direction;
    if (otherIndex < 0 || otherIndex >= metrics.length) return;
    const a = metrics[index];
    const b = metrics[otherIndex];
    setReordering(true);
    try {
      await Promise.all([
        authFetch(`/api/founder-metrics/${a.id}`, { method: 'PUT', body: JSON.stringify({ label: a.label, value: a.value, sortOrder: b.sortOrder }) }),
        authFetch(`/api/founder-metrics/${b.id}`, { method: 'PUT', body: JSON.stringify({ label: b.label, value: b.value, sortOrder: a.sortOrder }) }),
      ]);
      await refresh();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black uppercase text-gray-900 dark:text-white">Métricas rápidas del hero</h2>
          <p className="text-gray-400 text-[11px] font-mono normal-case mt-1">
            Déjalo vacío si no quieres mostrar nada — solo aparecen si hay al menos una.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-leybrak-blue text-white px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200"
        >
          <Plus size={15} /> Nueva
        </button>
      </div>

      {editingId && (
        <form onSubmit={handleSubmit} className="border-2 border-gray-900 dark:border-white bg-white dark:bg-[#0f0f12] p-6 flex flex-col gap-4 max-w-xl">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-leybrak-blue">
              {editingId === 'new' ? 'NUEVA' : 'EDITAR'}
            </span>
            <button type="button" onClick={closeForm} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <X size={18} />
            </button>
          </div>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Etiqueta (ej. Especialidad) *
            <input
              value={form.label}
              onChange={e => handleChange('label', e.target.value)}
              required
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Valor (ej. Metodología Kimball)
            <input
              value={form.value}
              onChange={e => handleChange('value', e.target.value)}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
            />
          </label>

          {editingId === 'new' && (
            <p className="text-gray-400 text-[11px] font-mono normal-case">
              Se agrega al final de la lista — después puedes reordenarla con las flechas ▲▼.
            </p>
          )}

          {error && <p className="text-red-500 text-[12px] font-mono">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-leybrak-blue text-white px-6 py-3 text-[12px] font-bold uppercase tracking-widest border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200 disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="px-6 py-3 text-[12px] font-bold uppercase tracking-widest border-2 border-gray-300 dark:border-white/20 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="border-2 border-gray-900 dark:border-white bg-white dark:bg-[#0f0f12] overflow-x-auto">
        {loading ? (
          <p className="p-6 text-gray-500 font-mono text-[13px]">Cargando...</p>
        ) : metrics.length === 0 ? (
          <p className="p-6 text-gray-500 font-mono text-[13px]">Todavía no hay métricas. Se ven bien 3 o 4.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-900 dark:border-white text-[10px] font-mono uppercase tracking-widest text-gray-500">
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Etiqueta</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => (
                <tr key={m.id} className="border-b border-gray-200 dark:border-white/10 text-[13px] text-gray-900 dark:text-white">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0 || reordering}
                        className="text-gray-400 hover:text-leybrak-blue disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        aria-label="Subir"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === metrics.length - 1 || reordering}
                        className="text-gray-400 hover:text-leybrak-blue disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        aria-label="Bajar"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold">{m.label}</td>
                  <td className="px-4 py-3 font-mono text-gray-500">{m.value}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(m)} className="text-gray-400 hover:text-leybrak-blue transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(m)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FounderMetricsPanel;
