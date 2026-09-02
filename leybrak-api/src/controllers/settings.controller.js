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
  'about_team_text',
  'descargas_subtitle',
  'descargas_empty_text',
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
