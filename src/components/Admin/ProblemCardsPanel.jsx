import { useState } from 'react';
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProblemCards } from '../../hooks/useProblemCards';

const EMPTY_FORM = { quote: '', context: '', who: '' };

// Panel dedicado para las tarjetas de "¿Te suena familiar?" de Inicio —
// tienen una forma propia (frase, contexto, rubro) que no encaja en el
// patrón genérico título/descripción usado por Servicios o Nosotros.
// El orden se maneja con las flechas ▲▼, nunca escribiendo un número.
const ProblemCardsPanel = () => {
  const { authFetch } = useAuth();
  const { cards, loading, refresh } = useProblemCards();

  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [reordering, setReordering] = useState(false);

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId('new'); setError(''); };
  const openEdit = (card) => {
    setForm({ quote: card.quote, context: card.context || '', who: card.who || '' });
    setEditingId(card.id);
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
        const nextOrder = cards.length > 0 ? Math.max(...cards.map(c => c.sortOrder ?? 0)) + 1 : 1;
        await authFetch('/api/problem-cards', { method: 'POST', body: JSON.stringify({ ...form, sortOrder: nextOrder }) });
      } else {
        const current = cards.find(c => c.id === editingId);
        await authFetch(`/api/problem-cards/${editingId}`, { method: 'PUT', body: JSON.stringify({ ...form, sortOrder: current?.sortOrder ?? 0 }) });
      }
      await refresh();
      closeForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (card) => {
    if (!window.confirm('¿Eliminar esta tarjeta?')) return;
    try {
      await authFetch(`/api/problem-cards/${card.id}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      window.alert(err.message);
    }
  };

  const move = async (index, direction) => {
    const otherIndex = index + direction;
    if (otherIndex < 0 || otherIndex >= cards.length) return;
    const a = cards[index];
    const b = cards[otherIndex];
    setReordering(true);
    try {
      await Promise.all([
        authFetch(`/api/problem-cards/${a.id}`, { method: 'PUT', body: JSON.stringify({ quote: a.quote, context: a.context, who: a.who, sortOrder: b.sortOrder }) }),
        authFetch(`/api/problem-cards/${b.id}`, { method: 'PUT', body: JSON.stringify({ quote: b.quote, context: b.context, who: b.who, sortOrder: a.sortOrder }) }),
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
        <h2 className="text-xl font-black uppercase text-gray-900 dark:text-white">Tarjetas de "¿Te suena familiar?"</h2>
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
            Frase (la queja, en primera persona) *
            <textarea
              value={form.quote}
              onChange={e => handleChange('quote', e.target.value)}
              required
              rows={2}
              placeholder={'No sé cuánto\nvendí hoy.'}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none resize-none normal-case"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Contexto (explica el problema)
            <textarea
              value={form.context}
              onChange={e => handleChange('context', e.target.value)}
              rows={2}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none resize-none normal-case"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Rubro (ej. Restaurante · Tienda · Bodega)
            <input
              value={form.who}
              onChange={e => handleChange('who', e.target.value)}
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
        ) : cards.length === 0 ? (
          <p className="p-6 text-gray-500 font-mono text-[13px]">Todavía no hay ninguna tarjeta. Crea la primera.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-900 dark:border-white text-[10px] font-mono uppercase tracking-widest text-gray-500">
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Frase</th>
                <th className="px-4 py-3">Rubro</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card, i) => (
                <tr key={card.id} className="border-b border-gray-200 dark:border-white/10 text-[13px] text-gray-900 dark:text-white">
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
                        disabled={i === cards.length - 1 || reordering}
                        className="text-gray-400 hover:text-leybrak-blue disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        aria-label="Bajar"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold whitespace-pre-line">{card.quote}</td>
                  <td className="px-4 py-3 text-gray-500">{card.who}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(card)} className="text-gray-400 hover:text-leybrak-blue transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(card)} className="text-gray-400 hover:text-red-500 transition-colors">
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

export default ProblemCardsPanel;
