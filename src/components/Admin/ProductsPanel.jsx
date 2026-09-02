import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProducts } from '../../hooks/useProducts';

const EMPTY_FORM = {
  type: 'producto',
  sysName: '',
  title: '',
  tag: '',
  description: '',
  features: '',
  to: '',
  cta: 'Saber más',
  imageUrl: '',
  available: true,
  sortOrder: 0,
};

const toFormState = (product) => ({
  type:       product.type,
  sysName:    product.sysName || '',
  title:      product.title || '',
  tag:        product.tag || '',
  description: product.description || '',
  features:   (product.features || []).join('\n'),
  to:         product.to || '',
  cta:        product.cta || 'Saber más',
  imageUrl:   product.imageUrl || '',
  available:  product.available,
  sortOrder:  product.sortOrder ?? 0,
});

const ProductsPanel = () => {
  const { authFetch } = useAuth();
  const { products, loading, refresh } = useProducts();

  const [editingId, setEditingId] = useState(null); // null = cerrado, 'new' = creando
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId('new');
    setError('');
  };

  const openEdit = (product) => {
    setForm(toFormState(product));
    setEditingId(product.id);
    setError('');
  };

  const closeForm = () => {
    setEditingId(null);
    setError('');
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      features:  form.features.split('\n').map(f => f.trim()).filter(Boolean),
      to:        form.to || null,
      imageUrl:  form.imageUrl || null,
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      if (editingId === 'new') {
        await authFetch('/api/products', { method: 'POST', body: JSON.stringify(payload) });
      } else {
        await authFetch(`/api/products/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      }
      await refresh();
      closeForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`¿Eliminar "${product.title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await authFetch(`/api/products/${product.id}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      window.alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black uppercase text-gray-900 dark:text-white">Productos y proyectos</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-leybrak-blue text-white px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200"
        >
          <Plus size={15} /> Nuevo
        </button>
      </div>

      {editingId && (
        <form onSubmit={handleSubmit} className="border-2 border-gray-900 dark:border-white bg-white dark:bg-[#0f0f12] p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-leybrak-blue">
              {editingId === 'new' ? 'NUEVO_ITEM' : 'EDITAR_ITEM'}
            </span>
            <button type="button" onClick={closeForm} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Tipo
              <select
                value={form.type}
                onChange={e => handleChange('type', e.target.value)}
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
              >
                <option value="producto">Producto</option>
                <option value="proyecto">Proyecto</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Nombre de sistema (ej. BRAVA_POS)
              <input
                value={form.sysName}
                onChange={e => handleChange('sysName', e.target.value)}
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Título *
            <input
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              required
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Etiqueta (ej. Producto listo, Próximamente)
            <input
              value={form.tag}
              onChange={e => handleChange('tag', e.target.value)}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Descripción
            <textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={3}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none resize-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Características (una por línea)
            <textarea
              value={form.features}
              onChange={e => handleChange('features', e.target.value)}
              rows={3}
              placeholder={'Control de caja al centavo\nInventario en vivo'}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none resize-none"
            />
          </label>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Enlace del botón (ruta o URL)
              <input
                value={form.to}
                onChange={e => handleChange('to', e.target.value)}
                placeholder="/softwares/leybrak-pos"
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Texto del botón
              <input
                value={form.cta}
                onChange={e => handleChange('cta', e.target.value)}
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Imagen (URL, opcional)
            <input
              value={form.imageUrl}
              onChange={e => handleChange('imageUrl', e.target.value)}
              placeholder="https://..."
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
            />
          </label>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-[11px] font-mono uppercase text-gray-500">
              <input
                type="checkbox"
                checked={form.available}
                onChange={e => handleChange('available', e.target.checked)}
                className="w-4 h-4 accent-leybrak-blue"
              />
              Disponible / visible
            </label>

            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Orden (menor = primero)
              <input
                type="number"
                value={form.sortOrder}
                onChange={e => handleChange('sortOrder', e.target.value)}
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
              />
            </label>
          </div>

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
        ) : products.length === 0 ? (
          <p className="p-6 text-gray-500 font-mono text-[13px]">Todavía no hay productos ni proyectos. Crea el primero.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-900 dark:border-white text-[10px] font-mono uppercase tracking-widest text-gray-500">
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Etiqueta</th>
                <th className="px-4 py-3">Visible</th>
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-gray-200 dark:border-white/10 text-[13px] text-gray-900 dark:text-white">
                  <td className="px-4 py-3 font-bold">{p.title}</td>
                  <td className="px-4 py-3 font-mono text-gray-500 capitalize">{p.type}</td>
                  <td className="px-4 py-3 text-gray-500">{p.tag}</td>
                  <td className="px-4 py-3">{p.available ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-3 font-mono text-gray-500">{p.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-leybrak-blue transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(p)} className="text-gray-400 hover:text-red-500 transition-colors">
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

export default ProductsPanel;
