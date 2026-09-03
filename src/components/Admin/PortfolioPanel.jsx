import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import FounderExperiencePanel from './FounderExperiencePanel';
import FounderProjectsPanel from './FounderProjectsPanel';
import FounderCertificationsPanel from './FounderCertificationsPanel';
import FounderMetricsPanel from './FounderMetricsPanel';
import FounderTestimonialsPanel from './FounderTestimonialsPanel';

const FIELDS = [
  'founder_status_label', 'founder_headline', 'founder_bio', 'founder_location',
  'founder_cv_url', 'founder_email', 'founder_linkedin_url', 'founder_github_url',
  'founder_skills', 'founder_languages', 'founder_personal_note', 'founder_interests',
  'founder_contact_subtitle',
];

// Panel de "Portafolio" — tu CV/portafolio público en /portafolio. El nombre,
// la foto y el rol se toman de tu tarjeta en la pestaña "Equipo" (la que
// tiene marcado "Es el fundador"); acá va todo lo demás: bio, estado, CV,
// redes, y las listas de trayectoria, proyectos y certificaciones.
const PortfolioPanel = () => {
  const { authFetch } = useAuth();
  const { settings, refresh } = useSiteSettings();

  const [form, setForm]       = useState(Object.fromEntries(FIELDS.map(f => [f, ''])));
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (() => setForm(Object.fromEntries(FIELDS.map(f => [f, settings[f] || '']))))();
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
        <div>
          <h2 className="text-xl font-black uppercase text-gray-900 dark:text-white">Portafolio — perfil</h2>
          <p className="text-gray-400 text-[11px] font-mono normal-case mt-1">
            Tu nombre, foto y rol se editan en la pestaña "Equipo" (marca "Es el fundador" en tu tarjeta).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="border-2 border-gray-900 dark:border-white bg-white dark:bg-[#0f0f12] p-6 flex flex-col gap-4 max-w-xl">
          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Estado (ej. Disponible para proyectos)
            <input
              value={form.founder_status_label}
              onChange={e => setForm(p => ({ ...p, founder_status_label: e.target.value }))}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Titular (ej. Ingeniero de Ciencia de Datos & IA)
            <input
              value={form.founder_headline}
              onChange={e => setForm(p => ({ ...p, founder_headline: e.target.value }))}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Bio (párrafo debajo del titular)
            <textarea
              value={form.founder_bio}
              onChange={e => setForm(p => ({ ...p, founder_bio: e.target.value }))}
              rows={3}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none resize-none normal-case"
            />
          </label>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Ciudad
              <input
                value={form.founder_location}
                onChange={e => setForm(p => ({ ...p, founder_location: e.target.value }))}
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              Correo de contacto
              <input
                value={form.founder_email}
                onChange={e => setForm(p => ({ ...p, founder_email: e.target.value }))}
                placeholder="tu@correo.com"
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            CV (enlace de descarga, PDF)
            <input
              value={form.founder_cv_url}
              onChange={e => setForm(p => ({ ...p, founder_cv_url: e.target.value }))}
              placeholder="https://..."
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
            />
          </label>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              LinkedIn
              <input
                value={form.founder_linkedin_url}
                onChange={e => setForm(p => ({ ...p, founder_linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/in/..."
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
              GitHub
              <input
                value={form.founder_github_url}
                onChange={e => setForm(p => ({ ...p, founder_github_url: e.target.value }))}
                placeholder="https://github.com/..."
                className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Tecnologías por categoría (una categoría por línea: "Categoría: tec1, tec2, tec3")
            <textarea
              value={form.founder_skills}
              onChange={e => setForm(p => ({ ...p, founder_skills: e.target.value }))}
              rows={4}
              placeholder={'Backend: Node.js, Express\nBase de datos: PostgreSQL, MySQL'}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none resize-none normal-case"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Idiomas (opcional, uno por línea: "Idioma: Nivel")
            <textarea
              value={form.founder_languages}
              onChange={e => setForm(p => ({ ...p, founder_languages: e.target.value }))}
              rows={2}
              placeholder={'Español: Nativo\nInglés: B2'}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none resize-none normal-case"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Nota personal (sección "Sobre mí", opcional)
            <textarea
              value={form.founder_personal_note}
              onChange={e => setForm(p => ({ ...p, founder_personal_note: e.target.value }))}
              rows={3}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none resize-none normal-case"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Intereses personales (una por línea, opcional — aparecen como etiquetas junto a la nota)
            <textarea
              value={form.founder_interests}
              onChange={e => setForm(p => ({ ...p, founder_interests: e.target.value }))}
              rows={3}
              placeholder={'Fitness y gimnasio\nCultura JDM / Car tuning'}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none resize-none normal-case"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            Subtítulo de la sección de contacto
            <textarea
              value={form.founder_contact_subtitle}
              onChange={e => setForm(p => ({ ...p, founder_contact_subtitle: e.target.value }))}
              rows={2}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none resize-none normal-case"
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

      <FounderMetricsPanel />
      <FounderExperiencePanel />
      <FounderProjectsPanel />
      <FounderCertificationsPanel />
      <FounderTestimonialsPanel />
    </div>
  );
};

export default PortfolioPanel;
