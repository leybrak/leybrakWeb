import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import ContentItemsPanel from './ContentItemsPanel';

const AboutPanel = () => {
  const { authFetch } = useAuth();
  const { settings, refresh } = useSiteSettings();

  const [form, setForm]       = useState({
    about_founded: '', about_city: '', about_mission: '',
    about_negocios: '', about_sectores: '', about_values_heading: '',
  });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (() => setForm({
      about_founded:        settings.about_founded || '',
      about_city:           settings.about_city || '',
      about_mission:        settings.about_mission || '',
      about_negocios:       settings.about_negocios || '',
      about_sectores:       settings.about_sectores || '',
      about_values_heading: settings.about_values_heading || '',
    }))();
  }, [settings]);

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
        <h2 className="text-xl font-black uppercase text-gray-900 dark:text-white">Nosotros — misión y datos</h2>

        <form onSubmit={handleSubmit} className="border-2 border-gray-900 dark:border-white bg-white dark:bg-[#0f0f12] p-6 flex flex-col gap-4 max-w-xl">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Fundada (año)
              <input
                value={form.about_founded}
                onChange={e => setForm(p => ({ ...p, about_founded: e.target.value }))}
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Ciudad
              <input
                value={form.about_city}
                onChange={e => setForm(p => ({ ...p, about_city: e.target.value }))}
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Misión (texto debajo del título de la página)
            <textarea
              value={form.about_mission}
              onChange={e => setForm(p => ({ ...p, about_mission: e.target.value }))}
              rows={3}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none resize-none normal-case"
            />
          </label>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Negocios (número de la estadística)
              <input
                value={form.about_negocios}
                onChange={e => setForm(p => ({ ...p, about_negocios: e.target.value }))}
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Sectores (número de la estadística)
              <input
                value={form.about_sectores}
                onChange={e => setForm(p => ({ ...p, about_sectores: e.target.value }))}
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Título de la sección de valores
            <input
              value={form.about_values_heading}
              onChange={e => setForm(p => ({ ...p, about_values_heading: e.target.value }))}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
            />
          </label>

          {error && <p className="text-red-500 text-[12px] font-mono">{error}</p>}
          {success && <p className="text-green-500 text-[12px] font-mono">{success}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 bg-leybrak-blue text-white px-6 py-3 text-[12px] font-bold uppercase tracking-widest border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200 disabled:opacity-60 w-fit"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      <ContentItemsPanel heading='Nosotros — "Lo que nos mueve"' apiPath="/api/about-values" itemLabel="valor" />

      <p className="text-gray-400 text-[11px] font-mono normal-case">
        El equipo que se muestra en /nosotros se administra en la pestaña "Equipo" —
        y tu portafolio completo (CV, proyectos, certificaciones) en la pestaña "Portafolio".
      </p>
    </div>
  );
};

export default AboutPanel;
