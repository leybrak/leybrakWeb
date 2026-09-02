import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSiteSettings } from '../../hooks/useSiteSettings';

// Textos sueltos de cada página que se pueden editar sin tocar código.
// Para agregar uno nuevo: crea la clave en el backend (settings.controller.js
// + migrate.js) y agrégala aquí, en el grupo de la página que corresponda.
const PAGE_GROUPS = [
  {
    page: 'Softwares',
    fields: [
      { key: 'softwares_subtitle', label: 'Subtítulo (debajo del título)', type: 'textarea' },
    ],
  },
  {
    page: 'Servicios',
    fields: [
      { key: 'servicios_subtitle',     label: 'Subtítulo (debajo del título)', type: 'textarea' },
      { key: 'servicios_cta_heading',  label: 'Título del bloque final ("¿No sabes por dónde empezar?")', type: 'input' },
      { key: 'servicios_cta_text',     label: 'Texto del bloque final', type: 'textarea' },
      { key: 'servicios_cta_tag',      label: 'Frase destacada (fondo oscuro)', type: 'input' },
      { key: 'servicios_cta_button',   label: 'Texto del botón', type: 'input' },
    ],
  },
  {
    page: 'Descargas',
    fields: [
      { key: 'descargas_subtitle',    label: 'Subtítulo (debajo del título)', type: 'textarea' },
      { key: 'descargas_empty_text',  label: 'Texto cuando no hay ninguna descarga disponible', type: 'textarea' },
    ],
  },
];

const PageCopyPanel = () => {
  const { authFetch } = useAuth();
  const { settings, refresh } = useSiteSettings();

  const [form, setForm]       = useState(settings);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { (() => setForm(settings))(); }, [settings]);

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await authFetch('/api/settings', { method: 'PUT', body: JSON.stringify(form) });
      await refresh();
      setSuccess('Guardado.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-black uppercase text-gray-900 dark:text-white">Contenido de las páginas</h2>

      <form onSubmit={handleSubmit} className="border-2 border-gray-900 dark:border-white bg-white dark:bg-[#0f0f12] p-6 flex flex-col gap-8 max-w-xl">
        {PAGE_GROUPS.map(group => (
          <div key={group.page} className="flex flex-col gap-4">
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-leybrak-blue">
              {group.page}
            </span>
            {group.fields.map(({ key, label, type }) => (
              <label key={key} className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
                {label}
                {type === 'textarea' ? (
                  <textarea
                    value={form[key] || ''}
                    onChange={e => handleChange(key, e.target.value)}
                    rows={3}
                    className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none resize-none normal-case"
                  />
                ) : (
                  <input
                    value={form[key] || ''}
                    onChange={e => handleChange(key, e.target.value)}
                    className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
                  />
                )}
              </label>
            ))}
          </div>
        ))}

        {error && <p className="text-red-500 text-[12px] font-mono">{error}</p>}
        {success && <p className="text-green-500 text-[12px] font-mono">{success}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-leybrak-blue text-white px-6 py-3 text-[12px] font-bold uppercase tracking-widest border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200 disabled:opacity-60 w-fit"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
};

export default PageCopyPanel;
