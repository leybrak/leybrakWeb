import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const FIELDS = [
  { key: 'whatsapp_number', label: 'Número de WhatsApp (solo dígitos, con código de país)', placeholder: '51976267494' },
  { key: 'contact_email',   label: 'Correo de contacto', placeholder: 'contacto@leybrak.com' },
  { key: 'contact_phone',   label: 'Teléfono de contacto (texto libre, para mostrar)', placeholder: '+51 976 267 494' },
  { key: 'instagram_url',   label: 'URL de Instagram', placeholder: 'https://instagram.com/leybrak' },
  { key: 'linkedin_url',    label: 'URL de LinkedIn', placeholder: 'https://linkedin.com/company/leybrak' },
  { key: 'twitter_url',     label: 'URL de Twitter / X', placeholder: 'https://x.com/leybrak' },
];

const SettingsPanel = () => {
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
      setSuccess('Configuración guardada.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-black uppercase text-gray-900 dark:text-white">Configuración de contacto</h2>

      <form onSubmit={handleSubmit} className="border-2 border-gray-900 dark:border-white bg-white dark:bg-[#0f0f12] p-6 flex flex-col gap-4 max-w-xl">
        {FIELDS.map(({ key, label, placeholder }) => (
          <label key={key} className="flex flex-col gap-1 text-[11px] font-mono uppercase text-gray-500">
            {label}
            <input
              value={form[key] || ''}
              onChange={e => handleChange(key, e.target.value)}
              placeholder={placeholder}
              className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white px-3 py-2.5 text-[13px] font-mono outline-none normal-case"
            />
          </label>
        ))}

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
  );
};

export default SettingsPanel;
