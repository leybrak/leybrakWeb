const pool = require('../db/pool');

const toClient = (row) => ({
  id:          row.id,
  productId:   row.product_id,
  name:        row.name,
  price:       row.price === null ? null : Number(row.price),
  priceNote:   row.price_note,
  tag:         row.tag,
  description: row.description,
  featured:    row.featured,
  features:    row.features,
  sortOrder:   row.sort_order,
});

// ── GET /api/plans?productId=... — público, lo consume la web ────────────────
const getPlans = async (req, res) => {
  const { productId } = req.query;

  try {
    const vals  = [];
    let   where = '';
    if (productId) {
      vals.push(productId);
      where = 'WHERE product_id = $1';
    }

    const result = await pool.query(
      `SELECT * FROM product_plans ${where} ORDER BY sort_order ASC, created_at ASC`,
      vals
    );

    return res.json({ ok: true, data: result.rows.map(toClient) });

  } catch (err) {
    console.error('❌ Error obteniendo planes:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── POST /api/plans — admin ────────────────────────────────────────────────────
const createPlan = async (req, res) => {
  const {
    productId, name, price = null, priceNote = '/mes', tag = '',
    description = '', featured = false, features = [], sortOrder = 0,
  } = req.body;

  if (!productId) {
    return res.status(422).json({ ok: false, message: 'Falta el producto al que pertenece el plan.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO product_plans (product_id, name, price, price_note, tag, description, featured, features, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [productId, name, price, priceNote, tag, description, featured, JSON.stringify(features), sortOrder]
    );

    return res.status(201).json({ ok: true, data: toClient(result.rows[0]) });

  } catch (err) {
    console.error('❌ Error creando plan:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── PUT /api/plans/:id — admin ─────────────────────────────────────────────────
const updatePlan = async (req, res) => {
  const { name, price, priceNote, tag, description, featured, features, sortOrder } = req.body;

  try {
    const result = await pool.query(
      `UPDATE product_plans SET
         name        = COALESCE($1, name),
         price       = $2,
         price_note  = COALESCE($3, price_note),
         tag         = COALESCE($4, tag),
         description = COALESCE($5, description),
         featured    = COALESCE($6, featured),
         features    = COALESCE($7, features),
         sort_order  = COALESCE($8, sort_order)
       WHERE id = $9
       RETURNING *`,
      [
        name, price === undefined ? null : price, priceNote, tag, description,
        featured, features ? JSON.stringify(features) : null, sortOrder,
        req.params.id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'Plan no encontrado.' });
    }

    return res.json({ ok: true, data: toClient(result.rows[0]) });

  } catch (err) {
    console.error('❌ Error actualizando plan:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── DELETE /api/plans/:id — admin ──────────────────────────────────────────────
const deletePlan = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM product_plans WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'Plan no encontrado.' });
    }
    return res.json({ ok: true, message: 'Plan eliminado.' });
  } catch (err) {
    console.error('❌ Error eliminando plan:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

module.exports = { getPlans, createPlan, updatePlan, deletePlan };
