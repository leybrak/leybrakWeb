const pool = require('../db/pool');

const toClient = (row) => ({
  id:          row.id,
  dateLabel:   row.date_label,
  title:       row.title,
  description: row.description,
  sortOrder:   row.sort_order,
});

// ── GET /api/founder-experience — público, lo consume /portafolio ─────────────
const getExperience = async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM founder_experience ORDER BY sort_order ASC, created_at ASC');
    return res.json({ ok: true, data: result.rows.map(toClient) });
  } catch (err) {
    console.error('❌ Error obteniendo trayectoria:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── POST /api/founder-experience — admin ───────────────────────────────────────
const createExperience = async (req, res) => {
  const { dateLabel = '', title, description = '', sortOrder = 0 } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO founder_experience (date_label, title, description, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [dateLabel, title, description, sortOrder]
    );
    return res.status(201).json({ ok: true, data: toClient(result.rows[0]) });
  } catch (err) {
    console.error('❌ Error creando trayectoria:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── PUT /api/founder-experience/:id — admin ────────────────────────────────────
const updateExperience = async (req, res) => {
  const { dateLabel, title, description, sortOrder } = req.body;
  try {
    const result = await pool.query(
      `UPDATE founder_experience SET
         date_label  = COALESCE($1, date_label),
         title       = COALESCE($2, title),
         description = COALESCE($3, description),
         sort_order  = COALESCE($4, sort_order)
       WHERE id = $5
       RETURNING *`,
      [dateLabel, title, description, sortOrder, req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'No encontrado.' });
    }
    return res.json({ ok: true, data: toClient(result.rows[0]) });
  } catch (err) {
    console.error('❌ Error actualizando trayectoria:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── DELETE /api/founder-experience/:id — admin ─────────────────────────────────
const deleteExperience = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM founder_experience WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'No encontrado.' });
    }
    return res.json({ ok: true, message: 'Eliminado.' });
  } catch (err) {
    console.error('❌ Error eliminando trayectoria:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

module.exports = { getExperience, createExperience, updateExperience, deleteExperience };
