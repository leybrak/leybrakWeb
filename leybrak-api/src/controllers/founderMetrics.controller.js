const pool = require('../db/pool');

const toClient = (row) => ({
  id:        row.id,
  label:     row.label,
  value:     row.value,
  sortOrder: row.sort_order,
});

// ── GET /api/founder-metrics — público, lo consume /portafolio ────────────────
const getMetrics = async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM founder_metrics ORDER BY sort_order ASC, created_at ASC');
    return res.json({ ok: true, data: result.rows.map(toClient) });
  } catch (err) {
    console.error('❌ Error obteniendo métricas:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── POST /api/founder-metrics — admin ──────────────────────────────────────────
const createMetric = async (req, res) => {
  const { label, value = '', sortOrder = 0 } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO founder_metrics (label, value, sort_order) VALUES ($1, $2, $3) RETURNING *`,
      [label, value, sortOrder]
    );
    return res.status(201).json({ ok: true, data: toClient(result.rows[0]) });
  } catch (err) {
    console.error('❌ Error creando métrica:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── PUT /api/founder-metrics/:id — admin ───────────────────────────────────────
const updateMetric = async (req, res) => {
  const { label, value, sortOrder } = req.body;
  try {
    const result = await pool.query(
      `UPDATE founder_metrics SET
         label      = COALESCE($1, label),
         value      = COALESCE($2, value),
         sort_order = COALESCE($3, sort_order)
       WHERE id = $4
       RETURNING *`,
      [label, value, sortOrder, req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'No encontrado.' });
    }
    return res.json({ ok: true, data: toClient(result.rows[0]) });
  } catch (err) {
    console.error('❌ Error actualizando métrica:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── DELETE /api/founder-metrics/:id — admin ────────────────────────────────────
const deleteMetric = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM founder_metrics WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'No encontrado.' });
    }
    return res.json({ ok: true, message: 'Eliminado.' });
  } catch (err) {
    console.error('❌ Error eliminando métrica:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

module.exports = { getMetrics, createMetric, updateMetric, deleteMetric };
