import { useState } from 'react';
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useContentItems } from '../../hooks/useContentItems';

const EMPTY_FORM = { type: 'work', dateLabel: '', title: '', description: '' };

const toPayload = (item) => ({ type: item.type, dateLabel: item.dateLabel, title: item.title, description: item.description });

// Trayectoria (experiencia y educación) del fundador — se muestra en /portafolio.
const FounderExperiencePanel = () => {
  const { authFetch } = useAuth();
  const { items, loading, refresh } = useContentItems('/api/founder-experience');

  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [reordering, setReordering] = useState(false);

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId('new'); setError(''); };
  const openEdit = (item) => {
    setForm({ type: item.type || 'work', dateLabel: item.dateLabel || '', title: item.title, description: item.description || '' });
    setEditingId(item.id);
    setError('');
  };
  const closeForm = () => { setEditingId(null); setError(''); };
  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId === 'new') {
        const nextOrder = items.length > 0 ? Math.max(...items.map(i => i.sortOrder ?? 0)) + 1 : 1;
        await authFetch('/api/founder-experience', { method: 'POST', body: JSON.stringify({ ...form, sortOrder: nextOrder }) });
      } else {
        const current = items.find(i => i.id === editingId);
        await authFetch(`/api/founder-experience/${editingId}`, { method: 'PUT', body: JSON.stringify({ ...form, sortOrder: current?.sortOrder ?? 0 }) });
      }
      await refresh();
      closeForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Eliminar "${item.title}"?`)) return;
    try {
      await authFetch(`/api/founder-experience/${item.id}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      window.alert(err.message);
    }
  };

  const move = async (index, direction) => {
    const otherIndex = index + direction;
    if (otherIndex < 0 || otherIndex >= items.length) return;
    const a = items[index];
    const b = items[otherIndex];
    setReordering(true);
    try {
      await Promise.all([
        authFetch(`/api/founder-experience/${a.id}`, { method: 'PUT', body: JSON.stringify({ ...toPayload(a), sortOrder: b.sortOrder }) }),
        authFetch(`/api/founder-experience/${b.id}`, { method: 'PUT', body: JSON.stringify({ ...toPayload(b), sortOrder: a.sortOrder }) }),
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
        <h2 className="text-xl font-black uppercase text-gray-900 dark:text-white">Trayectoria (experiencia y educación)</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-leybrak-blue text-white px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200"
        >
          <Plus size={15} /> Nuevo
        </button>
      </div>

      {editingId && (
        <form onSubmit={handleSubmit} className="border-2 border-gray-900 dark:border-white bg-white dark:bg-[#0f0f12] p-6 flex flex-col gap-4 max-w-xl">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-leybrak-blue">
              {editingId === 'new' ? 'NUEVO' : 'EDITAR'}
            </span>
            <button type="button" onClick={closeForm} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <X size={18} />
            </button>
          </div>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500 max-w-xs">
            Tipo
            <select
              value={form.type}
              onChange={e => handleChange('type', e.target.value)}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
            >
              <option value="work">Experiencia laboral</option>
              <option value="education">Educación</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Fecha (ej. 2026 — Actualidad)
            <input
              value={form.dateLabel}
              onChange={e => handleChange('dateLabel', e.target.value)}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Puesto / título *
            <input
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              required
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Descripción
            <textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={3}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none resize-none normal-case"
            />
          </label>

          {editingId === 'new' && (
            <p className="text-gray-400 text-[11px] font-mono normal-case">
              Se agrega al final de la lista — después puedes reordenarlo con las flechas ▲▼.
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
        ) : items.length === 0 ? (
          <p className="p-6 text-gray-500 font-mono text-[13px]">Todavía no hay nada en tu trayectoria. Agrega lo primero.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-900 dark:border-white text-[10px] font-mono uppercase tracking-widest text-gray-500">
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Puesto</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} className="border-b border-gray-200 dark:border-white/10 text-[13px] text-gray-900 dark:text-white">
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
                        disabled={i === items.length - 1 || reordering}
                        className="text-gray-400 hover:text-leybrak-blue disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        aria-label="Bajar"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-500">{item.type === 'education' ? 'Educación' : 'Experiencia'}</td>
                  <td className="px-4 py-3 font-mono text-gray-500">{item.dateLabel}</td>
                  <td className="px-4 py-3 font-bold">{item.title}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-leybrak-blue transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(item)} className="text-gray-400 hover:text-red-500 transition-colors">
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

export default FounderExperiencePanel;
