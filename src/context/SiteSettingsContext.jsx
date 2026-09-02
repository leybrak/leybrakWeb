// src/context/SiteSettingsContext.jsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';

export const SiteSettingsContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Valores por defecto — se usan mientras carga el fetch o si la API falla,
// así el sitio nunca se queda sin número de WhatsApp o correo de contacto.
export const DEFAULT_SETTINGS = {
  whatsapp_number: '51976267494',
  contact_email:   'contacto@leybrak.com',
  contact_phone:   '',
  instagram_url:   '',
  linkedin_url:    '',
  twitter_url:     '',
  about_founded:   '',
  about_city:      '',
  about_mission:   '',
  softwares_subtitle: 'Tres soluciones para tres necesidades distintas. Elige la que encaja con tu negocio hoy.',
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded]     = useState(false);

  const refresh = async () => {
    try {
      const res  = await fetch(`${API_URL}/api/settings`);
      const data = await res.json();
      if (res.ok && data.ok) {
        setSettings(prev => ({ ...prev, ...data.data }));
      }
    } catch {
      // Si falla, se quedan los valores por defecto
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => { (async () => { await refresh(); })(); }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loaded, refresh }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
