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
  servicios_subtitle: 'No importa en qué punto está tu negocio hoy. Tenemos un servicio para acompañarte desde el primer paso hasta la operación completa.',
  servicios_cta_heading: '¿No sabes por dónde empezar?',
  servicios_cta_text:    'Te hacemos un diagnóstico gratuito. Nos cuentas cómo trabajas y te decimos qué necesitas — sin venderte nada que no sea útil.',
  servicios_cta_tag:     'Diagnóstico gratuito, sin compromiso.',
  servicios_cta_button:  'Quiero el diagnóstico',
  about_negocios:        '1',
  about_sectores:        '1',
  about_values_heading:  'Lo que nos mueve',
  descargas_subtitle:    'Todas las apps de Leybrak listas para instalar. Iremos sumando cada nuevo sistema aquí a medida que esté disponible.',
  descargas_empty_text:  'Todavía no hay descargas disponibles. Vuelve pronto.',

  hero_label:              'Para negocios que quieren crecer de verdad',
  hero_heading_start:      'De libreta',
  hero_heading_highlight:  'sistema',
  hero_heading_end:        'en semanas.',
  hero_description_before: 'Si todavía usas papel, WhatsApp o Excel para manejar tu negocio, no estás solo.',
  hero_description_bold:   'Te ayudamos a digitalizar tu operación sin complicarte la vida',
  hero_description_after:  ', para que sepas exactamente qué pasa en tu negocio, desde donde estés.',
  hero_button_primary:     'Quiero digitalizar mi negocio',
  hero_button_secondary:   'Ver cómo funciona',

  problems_label:              'Lo que escuchamos todos los días',
  problems_heading_start:      '¿Te suena',
  problems_heading_highlight:  'familiar?',
  problems_subtitle:           'Estos no son problemas de tecnología. Son problemas de tiempo, de plata y de paz mental. Y tienen solución.',
  problems_cta_start:          'Si alguno de estos te llegó,',
  problems_cta_highlight:      'tenemos la solución.',

  howitworks_label:             'Sin complicaciones',
  howitworks_heading_start:     '¿Cómo',
  howitworks_heading_highlight: 'empezamos?',
  howitworks_saas_badge:        'Productos listos',
  howitworks_saas_subtitle:     'Para cuando quieres empezar ya.',
  howitworks_saas_tag:          'Operativo en menos de 48 horas',
  howitworks_saas_cta:          'Ver productos disponibles',
  howitworks_custom_badge:      'A tu medida',
  howitworks_custom_subtitle:   'Para cuando lo estándar no alcanza.',
  howitworks_custom_tag:        'Diagnóstico inicial sin costo',
  howitworks_custom_cta:        'Agendar diagnóstico gratis',
  howitworks_footer_note:       '// En cualquier caso — sin contratos largos, sin letra chica',

  founder_status_label:     'Disponible para proyectos',
  founder_headline:         '',
  founder_bio:               '',
  founder_location:          '',
  founder_cv_url:            '',
  founder_linkedin_url:      '',
  founder_github_url:        '',
  founder_personal_note:     '',
  founder_contact_subtitle:  '',
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
