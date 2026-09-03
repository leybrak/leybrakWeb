import { useState } from 'react';
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useContentItems } from '../../hooks/useContentItems';

const EMPTY_FORM = { name: '', role: '', photoUrl: '', bio: '', linkedinUrl: '', githubUrl: '', isFounder: false };

const toFormState = (m) => ({
  name:        m.name || '',
  role:        m.role || '',
  photoUrl:    m.photoUrl || '',
  bio:         m.bio || '',
  linkedinUrl: m.linkedinUrl || '',
  githubUrl:   m.githubUrl || '',
  isFounder:   !!m.isFounder,
});

const toPayload = (form) => ({
  name:        form.name,
  role:        form.role,
  photoUrl:    form.photoUrl || null,
  bio:         form.bio,
  linkedinUrl: form.linkedinUrl || null,
  githubUrl:   form.githubUrl || null,
  isFounder:   form.isFounder,
});

// Panel de "Equipo" para /nosotros — el fundador se marca con el checkbox
// "Es el fundador" y su tarjeta enlaza sola a /portafolio en la web pública.
const TeamPanel = () => {
  const { authFetch } = useAuth();
  const { items: members, loading, refresh } = useContentItems('/api/team-members');

  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [reordering, setReordering] = useState(false);

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId('new'); setError(''); };
  const openEdit = (m) => { setForm(toFormState(m)); setEditingId(m.id); setError(''); };
  const closeForm = () => { setEditingId(null); setError(''); };
  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId === 'new') {
        const nextOrder = members.length > 0 ? Math.max(...members.map(m => m.sortOrder ?? 0)) + 1 : 1;
        await authFetch('/api/team-members', { method: 'POST', body: JSON.stringify({ ...toPayload(form), sortOrder: nextOrder }) });
      } else {
        const current = members.find(m => m.id === editingId);
        await authFetch(`/api/team-members/${editingId}`, { method: 'PUT', body: JSON.stringify({ ...toPayload(form), sortOrder: current?.sortOrder ?? 0 }) });
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
    if (!window.confirm(`¿Eliminar a "${m.name}" del equipo?`)) return;
    try {
      await authFetch(`/api/team-members/${m.id}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      window.alert(err.message);
    }
  };

  const move = async (index, direction) => {
    const otherIndex = index + direction;
    if (otherIndex < 0 || otherIndex >= members.length) return;
    const a = members[index];
    const b = members[otherIndex];
    setReordering(true);
    try {
      await Promise.all([
        authFetch(`/api/team-members/${a.id}`, { method: 'PUT', body: JSON.stringify({ ...toPayload(a), sortOrder: b.sortOrder }) }),
        authFetch(`/api/team-members/${b.id}`, { method: 'PUT', body: JSON.stringify({ ...toPayload(b), sortOrder: a.sortOrder }) }),
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
        <h2 className="text-xl font-black uppercase text-gray-900 dark:text-white">Equipo</h2>
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

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Nombre *
              <input
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                required
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Rol (ej. Fundador · Full-stack)
              <input
                value={form.role}
                onChange={e => handleChange('role', e.target.value)}
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Foto (URL, opcional)
            <input
              value={form.photoUrl}
              onChange={e => handleChange('photoUrl', e.target.value)}
              placeholder="https://..."
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Bio corta
            <textarea
              value={form.bio}
              onChange={e => handleChange('bio', e.target.value)}
              rows={2}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none resize-none normal-case"
            />
          </label>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              LinkedIn (opcional)
              <input
                value={form.linkedinUrl}
                onChange={e => handleChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              GitHub (opcional)
              <input
                value={form.githubUrl}
                onChange={e => handleChange('githubUrl', e.target.value)}
                placeholder="https://github.com/..."
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-[11px] font-mono uppercase text-gray-500">
            <input
              type="checkbox"
              checked={form.isFounder}
              onChange={e => handleChange('isFounder', e.target.checked)}
              className="w-4 h-4 accent-leybrak-blue"
            />
            Es el fundador
          </label>
          <p className="text-gray-400 text-[11px] font-mono normal-case -mt-2">
            La tarjeta del fundador enlaza sola a tu portafolio completo (pestaña "Portafolio").
          </p>

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
        ) : members.length === 0 ? (
          <p className="p-6 text-gray-500 font-mono text-[13px]">Todavía no hay nadie en el equipo. Agrega al primero.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-900 dark:border-white text-[10px] font-mono uppercase tracking-widest text-gray-500">
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Fundador</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
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
                        disabled={i === members.length - 1 || reordering}
                        className="text-gray-400 hover:text-leybrak-blue disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        aria-label="Bajar"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold">{m.name}</td>
                  <td className="px-4 py-3 font-mono text-gray-500">{m.role}</td>
                  <td className="px-4 py-3">{m.isFounder ? 'Sí' : 'No'}</td>
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

export default TeamPanel;
