import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProducts } from '../../hooks/useProducts';
import { usePlans } from '../../hooks/usePlans';

const EMPTY_FORM = {
  name: '', price: '', priceNote: '/mes', tag: '', description: '',
  featured: false, featuresText: '', sortOrder: 0,
};

// Convierte [{text, ok}] <-> texto con líneas "✓ algo incluido" / "✗ algo no incluido"
const featuresToText = (features = []) =>
  features.map(f => `${f.ok ? '✓' : '✗'} ${f.text}`).join('\n');

const textToFeatures = (text) =>
  text.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
    const ok = line.startsWith('✓');
    const cleanText = line.replace(/^[✓✗]\s*/, '');
    return { text: cleanText, ok };
  });

const toFormState = (plan) => ({
  name:         plan.name || '',
  price:        plan.price ?? '',
  priceNote:    plan.priceNote || '/mes',
  tag:          plan.tag || '',
  description:  plan.description || '',
  featured:     plan.featured,
  featuresText: featuresToText(plan.features),
  sortOrder:    plan.sortOrder ?? 0,
});

const PlansPanel = () => {
  const { authFetch } = useAuth();
  const { products } = useProducts();
  const [productId, setProductId] = useState('');
  const { plans, loading, refresh } = usePlans(productId || null);

  useEffect(() => {
    if (!productId && products.length > 0) (() => setProductId(products[0].id))();
  }, [products, productId]);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId('new'); setError(''); };
  const openEdit = (plan) => { setForm(toFormState(plan)); setEditingId(plan.id); setError(''); };
  const closeForm = () => { setEditingId(null); setError(''); };
  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      productId,
      name:        form.name,
      price:       form.price === '' ? null : Number(form.price),
      priceNote:   form.priceNote,
      tag:         form.tag,
      description: form.description,
      featured:    form.featured,
      features:    textToFeatures(form.featuresText),
      sortOrder:   Number(form.sortOrder) || 0,
    };

    try {
      if (editingId === 'new') {
        await authFetch('/api/plans', { method: 'POST', body: JSON.stringify(payload) });
      } else {
        await authFetch(`/api/plans/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      }
      await refresh();
      closeForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`¿Eliminar el plan "${plan.name}"?`)) return;
    try {
      await authFetch(`/api/plans/${plan.id}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      window.alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-black uppercase text-gray-900 dark:text-white">Planes de precio</h2>
        <button
          onClick={openCreate}
          disabled={!productId}
          className="flex items-center gap-2 bg-leybrak-blue text-white px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200 disabled:opacity-50"
        >
          <Plus size={15} /> Nuevo plan
        </button>
      </div>

      <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500 max-w-sm">
        Producto
        <select
          value={productId}
          onChange={e => { setProductId(e.target.value); closeForm(); }}
          className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
        >
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </label>

      {editingId && (
        <form onSubmit={handleSubmit} className="border-2 border-gray-900 dark:border-white bg-white dark:bg-[#0f0f12] p-6 flex flex-col gap-4 max-w-xl">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-leybrak-blue">
              {editingId === 'new' ? 'NUEVO_PLAN' : 'EDITAR_PLAN'}
            </span>
            <button type="button" onClick={closeForm} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Nombre del plan *
              <input
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                required
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Etiqueta (ej. Más popular)
              <input
                value={form.tag}
                onChange={e => handleChange('tag', e.target.value)}
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
              />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Precio (número, ej. 80)
              <input
                type="number" step="0.01"
                value={form.price}
                onChange={e => handleChange('price', e.target.value)}
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Sufijo del precio (ej. /mes)
              <input
                value={form.priceNote}
                onChange={e => handleChange('priceNote', e.target.value)}
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Descripción corta
            <textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={2}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none resize-none normal-case"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Qué incluye (una por línea — empieza con ✓ si está incluido, ✗ si no)
            <textarea
              value={form.featuresText}
              onChange={e => handleChange('featuresText', e.target.value)}
              rows={6}
              placeholder={'✓ 1 sede\n✓ Terminal POS ilimitado\n✗ Bot de WhatsApp'}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none resize-none normal-case"
            />
          </label>

          <label className="flex items-center gap-2 text-[11px] font-mono uppercase text-gray-500">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={e => handleChange('featured', e.target.checked)}
              className="w-4 h-4 accent-leybrak-blue"
            />
            Destacar este plan (ej. "Más popular")
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500 max-w-[160px]">
            Orden
            <input
              type="number"
              value={form.sortOrder}
              onChange={e => handleChange('sortOrder', e.target.value)}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
            />
          </label>

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
        ) : plans.length === 0 ? (
          <p className="p-6 text-gray-500 font-mono text-[13px]">Este producto todavía no tiene planes.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-900 dark:border-white text-[10px] font-mono uppercase tracking-widest text-gray-500">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Destacado</th>
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id} className="border-b border-gray-200 dark:border-white/10 text-[13px] text-gray-900 dark:text-white">
                  <td className="px-4 py-3 font-bold">{plan.name}</td>
                  <td className="px-4 py-3 font-mono text-gray-500">
                    {plan.price !== null ? `S/${plan.price}${plan.priceNote}` : '—'}
                  </td>
                  <td className="px-4 py-3">{plan.featured ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-3 font-mono text-gray-500">{plan.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(plan)} className="text-gray-400 hover:text-leybrak-blue transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(plan)} className="text-gray-400 hover:text-red-500 transition-colors">
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

export default PlansPanel;
