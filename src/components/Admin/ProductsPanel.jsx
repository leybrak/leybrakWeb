import { useState } from 'react';
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProducts } from '../../hooks/useProducts';

const EMPTY_FORM = {
  type: 'producto',
  sysName: '',
  title: '',
  tag: '',
  description: '',
  features: '',
  cta: 'Saber más',
  imageUrl: '',
  available: true,
  downloadUrl: '',
  platform: 'both',
  images: [],
};

const toFormState = (product) => ({
  type:       product.type,
  sysName:    product.sysName || '',
  title:      product.title || '',
  tag:        product.tag || '',
  description: product.description || '',
  features:   (product.features || []).join('\n'),
  cta:        product.cta || 'Saber más',
  imageUrl:   product.imageUrl || '',
  available:  product.available,
  downloadUrl: product.downloadUrl || '',
  platform:   product.platform || 'both',
  images:     product.images && product.images.length > 0 ? product.images : [],
});

// Todos los campos que puede llevar un producto, salvo el orden (que se
// maneja aparte con las flechas ▲▼) — se reutiliza para guardar y para
// reordenar, así el PUT siempre manda el objeto completo.
const toPayload = (form) => ({
  type:        form.type,
  sysName:     form.sysName,
  title:       form.title,
  tag:         form.tag,
  description: form.description,
  features:    Array.isArray(form.features) ? form.features : form.features.split('\n').map(f => f.trim()).filter(Boolean),
  cta:         form.cta,
  imageUrl:    form.imageUrl || null,
  available:   form.available,
  downloadUrl: form.downloadUrl || null,
  platform:    form.platform,
  images:      (form.images || []).filter(img => img.url?.trim()),
});

const ProductsPanel = () => {
  const { authFetch } = useAuth();
  const { products, loading, refresh } = useProducts();

  const [editingId, setEditingId] = useState(null); // null = cerrado, 'new' = creando
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [reordering, setReordering] = useState(false);

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

  const addImage = () => setForm(prev => ({ ...prev, images: [...prev.images, { url: '', label: '', description: '', cover: false }] }));
  const removeImage = (i) => setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
  const changeImage = (i, field, value) => setForm(prev => ({
    ...prev,
    images: prev.images.map((img, idx) => idx === i ? { ...img, [field]: value } : img),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingId === 'new') {
        const nextOrder = products.length > 0 ? Math.max(...products.map(p => p.sortOrder ?? 0)) + 1 : 1;
        await authFetch('/api/products', { method: 'POST', body: JSON.stringify({ ...toPayload(form), sortOrder: nextOrder }) });
      } else {
        const current = products.find(p => p.id === editingId);
        await authFetch(`/api/products/${editingId}`, { method: 'PUT', body: JSON.stringify({ ...toPayload(form), sortOrder: current?.sortOrder ?? 0 }) });
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

  const move = async (index, direction) => {
    const otherIndex = index + direction;
    if (otherIndex < 0 || otherIndex >= products.length) return;
    const a = products[index];
    const b = products[otherIndex];
    setReordering(true);
    try {
      await Promise.all([
        authFetch(`/api/products/${a.id}`, { method: 'PUT', body: JSON.stringify({ ...toPayload(a), sortOrder: b.sortOrder }) }),
        authFetch(`/api/products/${b.id}`, { method: 'PUT', body: JSON.stringify({ ...toPayload(b), sortOrder: a.sortOrder }) }),
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

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500 max-w-xs">
            Texto del botón
            <input
              value={form.cta}
              onChange={e => handleChange('cta', e.target.value)}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
            />
          </label>
          <p className="text-gray-400 text-[11px] font-mono normal-case -mt-2">
            El botón siempre lleva a la página de presentación propia del producto — se crea sola.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Imagen de la tarjeta (URL, opcional)
              <input
                value={form.imageUrl}
                onChange={e => handleChange('imageUrl', e.target.value)}
                placeholder="https://..."
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Enlace de descarga (aparece en /descargas si se llena)
              <input
                value={form.downloadUrl}
                onChange={e => handleChange('downloadUrl', e.target.value)}
                placeholder="https://..."
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500 max-w-xs">
            Plataforma
            <select
              value={form.platform}
              onChange={e => handleChange('platform', e.target.value)}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
            >
              <option value="both">Celular y escritorio</option>
              <option value="mobile">Solo celular</option>
              <option value="desktop">Solo escritorio</option>
            </select>
          </label>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-gray-500">
                Galería de imágenes (para la página de presentación del sistema)
              </span>
              <button
                type="button"
                onClick={addImage}
                className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-leybrak-blue hover:underline"
              >
                <Plus size={13} /> Agregar imagen
              </button>
            </div>

            {form.images.length === 0 ? (
              <p className="text-gray-400 text-[12px] font-mono">Sin imágenes todavía.</p>
            ) : (
              <p className="text-gray-400 text-[11px] font-mono normal-case">
                Marca "Mostrar en portada" en las imágenes que quieres destacar arriba en la
                página del producto; el resto aparece en la galería.
              </p>
            )}

            {form.images.map((img, i) => (
              <div key={i} className="border border-gray-300 dark:border-white/20 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400">Imagen {i + 1}</span>
                  <button type="button" onClick={() => removeImage(i)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  value={img.url}
                  onChange={e => changeImage(i, 'url', e.target.value)}
                  placeholder="URL de la imagen (https://...)"
                  className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2 text-[12px] font-mono outline-none"
                />
                <input
                  value={img.label}
                  onChange={e => changeImage(i, 'label', e.target.value)}
                  placeholder="Título corto (ej. Panel de control)"
                  className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2 text-[12px] font-mono outline-none normal-case"
                />
                <input
                  value={img.description}
                  onChange={e => changeImage(i, 'description', e.target.value)}
                  placeholder="Descripción corta (opcional)"
                  className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2 text-[12px] font-mono outline-none normal-case"
                />
                <label className="flex items-center gap-2 text-[11px] font-mono uppercase text-gray-500">
                  <input
                    type="checkbox"
                    checked={!!img.cover}
                    onChange={e => changeImage(i, 'cover', e.target.checked)}
                    className="w-4 h-4 accent-leybrak-blue"
                  />
                  Mostrar en portada
                </label>
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2 text-[11px] font-mono uppercase text-gray-500">
            <input
              type="checkbox"
              checked={form.available}
              onChange={e => handleChange('available', e.target.checked)}
              className="w-4 h-4 accent-leybrak-blue"
            />
            Disponible / visible
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
        ) : products.length === 0 ? (
          <p className="p-6 text-gray-500 font-mono text-[13px]">Todavía no hay productos ni proyectos. Crea el primero.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-900 dark:border-white text-[10px] font-mono uppercase tracking-widest text-gray-500">
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Plataforma</th>
                <th className="px-4 py-3">Descarga</th>
                <th className="px-4 py-3">Visible</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} className="border-b border-gray-200 dark:border-white/10 text-[13px] text-gray-900 dark:text-white">
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
                        disabled={i === products.length - 1 || reordering}
                        className="text-gray-400 hover:text-leybrak-blue disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        aria-label="Bajar"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold">{p.title}</td>
                  <td className="px-4 py-3 font-mono text-gray-500 capitalize">{p.type}</td>
                  <td className="px-4 py-3 font-mono text-gray-500 capitalize">{p.platform}</td>
                  <td className="px-4 py-3">{p.downloadUrl ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-3">{p.available ? 'Sí' : 'No'}</td>
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
