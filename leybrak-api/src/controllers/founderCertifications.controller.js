const pool = require('../db/pool');

const toClient = (row) => ({
  id:               row.id,
  name:             row.name,
  issuer:           row.issuer,
  issuerLogoUrl:    row.issuer_logo_url,
  certificateLink:  row.certificate_link,
  dateEarned:       row.date_earned,
  sortOrder:        row.sort_order,
});

// ── GET /api/founder-certifications — público, lo consume /portafolio ─────────
const getCertifications = async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM founder_certifications ORDER BY sort_order ASC, created_at ASC');
    return res.json({ ok: true, data: result.rows.map(toClient) });
  } catch (err) {
    console.error('❌ Error obteniendo certificaciones:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── POST /api/founder-certifications — admin ───────────────────────────────────
const createCertification = async (req, res) => {
  const {
    name, issuer = '', issuerLogoUrl = null, certificateLink = null,
    dateEarned = '', sortOrder = 0,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO founder_certifications (name, issuer, issuer_logo_url, certificate_link, date_earned, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, issuer, issuerLogoUrl, certificateLink, dateEarned, sortOrder]
    );
    return res.status(201).json({ ok: true, data: toClient(result.rows[0]) });
  } catch (err) {
    console.error('❌ Error creando certificación:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── PUT /api/founder-certifications/:id — admin ────────────────────────────────
const updateCertification = async (req, res) => {
  const { name, issuer, issuerLogoUrl, certificateLink, dateEarned, sortOrder } = req.body;

  try {
    const result = await pool.query(
      `UPDATE founder_certifications SET
         name             = COALESCE($1, name),
         issuer           = COALESCE($2, issuer),
         issuer_logo_url  = $3,
         certificate_link = $4,
         date_earned      = COALESCE($5, date_earned),
         sort_order       = COALESCE($6, sort_order)
       WHERE id = $7
       RETURNING *`,
      [name, issuer, issuerLogoUrl, certificateLink, dateEarned, sortOrder, req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'No encontrado.' });
    }
    return res.json({ ok: true, data: toClient(result.rows[0]) });
  } catch (err) {
    console.error('❌ Error actualizando certificación:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── DELETE /api/founder-certifications/:id — admin ─────────────────────────────
const deleteCertification = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM founder_certifications WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'No encontrado.' });
    }
    return res.json({ ok: true, message: 'Eliminado.' });
  } catch (err) {
    console.error('❌ Error eliminando certificación:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

module.exports = { getCertifications, createCertification, updateCertification, deleteCertification };
