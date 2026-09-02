import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import ContentItemsPanel from './ContentItemsPanel';
import ProblemCardsPanel from './ProblemCardsPanel';

// Grupos de texto suelto del Inicio (Hero, Problemas, Cómo funciona).
const GROUPS = [
  {
    title: 'Hero — lo primero que se ve',
    fields: [
      { key: 'hero_label', label: 'Etiqueta superior', type: 'input' },
      { key: 'hero_heading_start', label: 'Título — línea 1 ("De libreta")', type: 'input' },
      { key: 'hero_heading_highlight', label: 'Título — palabra resaltada en azul ("sistema")', type: 'input' },
      { key: 'hero_heading_end', label: 'Título — línea 3 ("en semanas.")', type: 'input' },
      { key: 'hero_description_before', label: 'Descripción — antes de la parte en negrita', type: 'textarea' },
      { key: 'hero_description_bold', label: 'Descripción — parte en negrita', type: 'textarea' },
      { key: 'hero_description_after', label: 'Descripción — después de la parte en negrita', type: 'textarea' },
      { key: 'hero_button_primary', label: 'Botón principal', type: 'input' },
      { key: 'hero_button_secondary', label: 'Botón secundario', type: 'input' },
    ],
  },
  {
    title: 'Problemas — "¿Te suena familiar?"',
    fields: [
      { key: 'problems_label', label: 'Etiqueta superior', type: 'input' },
      { key: 'problems_heading_start', label: 'Título — inicio ("¿Te suena")', type: 'input' },
      { key: 'problems_heading_highlight', label: 'Título — palabra resaltada ("familiar?")', type: 'input' },
      { key: 'problems_subtitle', label: 'Subtítulo', type: 'textarea' },
      { key: 'problems_cta_start', label: 'Frase final — inicio', type: 'input' },
      { key: 'problems_cta_highlight', label: 'Frase final — parte resaltada en azul', type: 'input' },
    ],
  },
  {
    title: 'Cómo funciona',
    fields: [
      { key: 'howitworks_label', label: 'Etiqueta superior', type: 'input' },
      { key: 'howitworks_heading_start', label: 'Título — inicio ("¿Cómo")', type: 'input' },
      { key: 'howitworks_heading_highlight', label: 'Título — palabra resaltada ("empezamos?")', type: 'input' },
      { key: 'howitworks_saas_badge', label: 'Camino A — etiqueta ("Productos listos")', type: 'input' },
      { key: 'howitworks_saas_subtitle', label: 'Camino A — subtítulo', type: 'input' },
      { key: 'howitworks_saas_tag', label: 'Camino A — frase final (con ícono de check)', type: 'input' },
      { key: 'howitworks_saas_cta', label: 'Camino A — texto del botón', type: 'input' },
      { key: 'howitworks_custom_badge', label: 'Camino B — etiqueta ("A tu medida")', type: 'input' },
      { key: 'howitworks_custom_subtitle', label: 'Camino B — subtítulo', type: 'input' },
      { key: 'howitworks_custom_tag', label: 'Camino B — frase final (con ícono de check)', type: 'input' },
      { key: 'howitworks_custom_cta', label: 'Camino B — texto del botón', type: 'input' },
      { key: 'howitworks_footer_note', label: 'Nota al pie de la sección', type: 'input' },
    ],
  },
];

const InicioPanel = () => {
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
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-black uppercase text-gray-900 dark:text-white">Inicio — textos</h2>

        <form onSubmit={handleSubmit} className="border-2 border-gray-900 dark:border-white bg-white dark:bg-[#0f0f12] p-6 flex flex-col gap-8 max-w-2xl">
          {GROUPS.map(group => (
            <div key={group.title} className="flex flex-col gap-4">
              <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-leybrak-blue">
                {group.title}
              </span>
              {group.fields.map(({ key, label, type }) => (
                <label key={key} className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
                  {label}
                  {type === 'textarea' ? (
                    <textarea
                      value={form[key] || ''}
                      onChange={e => handleChange(key, e.target.value)}
                      rows={2}
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

      <ContentItemsPanel
        heading='Hero — panel "Lo que creemos"'
        apiPath="/api/manifesto"
        itemLabel="frase"
        hideDescription
        titleLabel="Frase (usa Enter para partir en dos líneas) *"
        titleMultiline
      />

      <ProblemCardsPanel />

      <ContentItemsPanel
        heading='Cómo funciona — pasos del Camino A ("Productos listos")'
        apiPath="/api/saas-steps"
        itemLabel="paso"
      />

      <ContentItemsPanel
        heading='Cómo funciona — pasos del Camino B ("A tu medida")'
        apiPath="/api/custom-steps"
        itemLabel="paso"
      />
    </div>
  );
};

export default InicioPanel;
