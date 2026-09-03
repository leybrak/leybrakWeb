const pool = require('../db/pool');

const toClient = (row) => ({
  id:         row.id,
  quote:      row.quote,
  authorName: row.author_name,
  authorRole: row.author_role,
  sortOrder:  row.sort_order,
});

// ── GET /api/founder-testimonials — público, lo consume /portafolio ───────────
const getTestimonials = async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM founder_testimonials ORDER BY sort_order ASC, created_at ASC');
    return res.json({ ok: true, data: result.rows.map(toClient) });
  } catch (err) {
    console.error('❌ Error obteniendo testimonios:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── POST /api/founder-testimonials — admin ─────────────────────────────────────
const createTestimonial = async (req, res) => {
  const { quote, authorName, authorRole = '', sortOrder = 0 } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO founder_testimonials (quote, author_name, author_role, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [quote, authorName, authorRole, sortOrder]
    );
    return res.status(201).json({ ok: true, data: toClient(result.rows[0]) });
  } catch (err) {
    console.error('❌ Error creando testimonio:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── PUT /api/founder-testimonials/:id — admin ──────────────────────────────────
const updateTestimonial = async (req, res) => {
  const { quote, authorName, authorRole, sortOrder } = req.body;
  try {
    const result = await pool.query(
      `UPDATE founder_testimonials SET
         quote       = COALESCE($1, quote),
         author_name = COALESCE($2, author_name),
         author_role = COALESCE($3, author_role),
         sort_order  = COALESCE($4, sort_order)
       WHERE id = $5
       RETURNING *`,
      [quote, authorName, authorRole, sortOrder, req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'No encontrado.' });
    }
    return res.json({ ok: true, data: toClient(result.rows[0]) });
  } catch (err) {
    console.error('❌ Error actualizando testimonio:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── DELETE /api/founder-testimonials/:id — admin ───────────────────────────────
const deleteTestimonial = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM founder_testimonials WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'No encontrado.' });
    }
    return res.json({ ok: true, message: 'Eliminado.' });
  } catch (err) {
    console.error('❌ Error eliminando testimonio:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

module.exports = { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };
