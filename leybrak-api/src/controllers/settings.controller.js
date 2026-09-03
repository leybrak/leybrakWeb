const pool = require('../db/pool');

// Únicas claves editables — evita que se inyecten claves arbitrarias
const ALLOWED_KEYS = [
  'whatsapp_number',
  'contact_email',
  'contact_phone',
  'instagram_url',
  'linkedin_url',
  'twitter_url',
  'about_founded',
  'about_city',
  'about_mission',
  'softwares_subtitle',
  'servicios_subtitle',
  'servicios_cta_heading',
  'servicios_cta_text',
  'servicios_cta_tag',
  'servicios_cta_button',
  'about_negocios',
  'about_sectores',
  'about_values_heading',
  'descargas_subtitle',
  'descargas_empty_text',
  'hero_label',
  'hero_heading_start',
  'hero_heading_highlight',
  'hero_heading_end',
  'hero_description_before',
  'hero_description_bold',
  'hero_description_after',
  'hero_button_primary',
  'hero_button_secondary',
  'problems_label',
  'problems_heading_start',
  'problems_heading_highlight',
  'problems_subtitle',
  'problems_cta_start',
  'problems_cta_highlight',
  'howitworks_label',
  'howitworks_heading_start',
  'howitworks_heading_highlight',
  'howitworks_saas_badge',
  'howitworks_saas_subtitle',
  'howitworks_saas_tag',
  'howitworks_saas_cta',
  'howitworks_custom_badge',
  'howitworks_custom_subtitle',
  'howitworks_custom_tag',
  'howitworks_custom_cta',
  'howitworks_footer_note',

  // Portafolio del fundador (/portafolio)
  'founder_status_label',
  'founder_headline',
  'founder_bio',
  'founder_location',
  'founder_cv_url',
  'founder_linkedin_url',
  'founder_github_url',
  'founder_personal_note',
  'founder_contact_subtitle',
];

// ── GET /api/settings — público, lo consume la web ────────────────────────────
const getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings');
    const data = Object.fromEntries(result.rows.map(r => [r.key, r.value]));
    return res.json({ ok: true, data });
  } catch (err) {
    console.error('❌ Error obteniendo configuración:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── PUT /api/settings — admin ──────────────────────────────────────────────────
const updateSettings = async (req, res) => {
  const updates = Object.entries(req.body || {}).filter(([key]) => ALLOWED_KEYS.includes(key));

  if (updates.length === 0) {
    return res.status(422).json({ ok: false, message: 'No se enviaron campos válidos.' });
  }

  try {
    for (const [key, value] of updates) {
      await pool.query(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key, String(value ?? '')]
      );
    }

    const result = await pool.query('SELECT key, value FROM settings');
    const data = Object.fromEntries(result.rows.map(r => [r.key, r.value]));

    return res.json({ ok: true, data });

  } catch (err) {
    console.error('❌ Error actualizando configuración:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

module.exports = { getSettings, updateSettings };
