const pool = require('../db/pool');

const toClient = (row) => ({
  id:        row.id,
  quote:     row.quote,
  context:   row.context,
  who:       row.who,
  sortOrder: row.sort_order,
});

// ── GET /api/problem-cards — público, lo consume la web ───────────────────────
const getProblemCards = async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM problem_cards ORDER BY sort_order ASC, created_at ASC');
    return res.json({ ok: true, data: result.rows.map(toClient) });
  } catch (err) {
    console.error('❌ Error obteniendo tarjetas de problemas:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── POST /api/problem-cards — admin ────────────────────────────────────────────
const createProblemCard = async (req, res) => {
  const { quote, context = '', who = '', sortOrder = 0 } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO problem_cards (quote, context, who, sort_order) VALUES ($1, $2, $3, $4) RETURNING *`,
      [quote, context, who, sortOrder]
    );
    return res.status(201).json({ ok: true, data: toClient(result.rows[0]) });
  } catch (err) {
    console.error('❌ Error creando tarjeta de problema:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── PUT /api/problem-cards/:id — admin ─────────────────────────────────────────
const updateProblemCard = async (req, res) => {
  const { quote, context, who, sortOrder } = req.body;
  try {
    const result = await pool.query(
      `UPDATE problem_cards SET
         quote      = COALESCE($1, quote),
         context    = COALESCE($2, context),
         who        = COALESCE($3, who),
         sort_order = COALESCE($4, sort_order)
       WHERE id = $5
       RETURNING *`,
      [quote, context, who, sortOrder, req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'No encontrado.' });
    }
    return res.json({ ok: true, data: toClient(result.rows[0]) });
  } catch (err) {
    console.error('❌ Error actualizando tarjeta de problema:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── DELETE /api/problem-cards/:id — admin ──────────────────────────────────────
const deleteProblemCard = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM problem_cards WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'No encontrado.' });
    }
    return res.json({ ok: true, message: 'Eliminado.' });
  } catch (err) {
    console.error('❌ Error eliminando tarjeta de problema:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

module.exports = { getProblemCards, createProblemCard, updateProblemCard, deleteProblemCard };
