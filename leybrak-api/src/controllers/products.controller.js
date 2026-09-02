const pool = require('../db/pool');
const { slugify } = require('../utils/slugify');

const toClient = (row) => ({
  id:          row.id,
  type:        row.type,
  sysName:     row.sys_name,
  title:       row.title,
  tag:         row.tag,
  description: row.description,
  features:    row.features,
  to:          `/softwares/${row.slug}`,
  cta:         row.cta_label,
  imageUrl:    row.image_url,
  available:   row.available,
  sortOrder:   row.sort_order,
  downloadUrl: row.download_url,
  platform:    row.platform,
  images:      row.images,
  slug:        row.slug,
});

// Genera un slug único a partir del título — nunca se le pide al admin.
const generateUniqueSlug = async (title) => {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { rowCount } = await pool.query('SELECT 1 FROM products WHERE slug = $1', [slug]);
    if (rowCount === 0) return slug;
    slug = `${base}-${n}`;
    n++;
  }
};

// ── GET /api/products — público, lo consume la web ────────────────────────────
const getProducts = async (req, res) => {
  const { type } = req.query;

  try {
    const vals  = [];
    let   where = '';
    if (type) {
      vals.push(type);
      where = 'WHERE type = $1';
    }

    const result = await pool.query(
      `SELECT * FROM products ${where} ORDER BY sort_order ASC, created_at ASC`,
      vals
    );

    return res.json({ ok: true, data: result.rows.map(toClient) });

  } catch (err) {
    console.error('❌ Error obteniendo productos:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── GET /api/products/:id — admin ──────────────────────────────────────────────
const getProduct = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'Producto no encontrado.' });
    }
    return res.json({ ok: true, data: toClient(result.rows[0]) });
  } catch (err) {
    console.error('❌ Error obteniendo producto:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── POST /api/products — admin ─────────────────────────────────────────────────
const createProduct = async (req, res) => {
  const {
    type = 'producto', sysName = '', title, tag = '', description = '',
    features = [], to = null, cta = 'Saber más', imageUrl = null,
    available = true, sortOrder = 0,
    downloadUrl = null, platform = 'both', images = [],
  } = req.body;

  try {
    const slug = await generateUniqueSlug(title);
    const result = await pool.query(
      `INSERT INTO products (type, sys_name, title, tag, description, features, link_to, cta_label, image_url, available, sort_order, download_url, platform, images, slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [type, sysName, title, tag, description, JSON.stringify(features), to, cta, imageUrl, available, sortOrder, downloadUrl, platform, JSON.stringify(images), slug]
    );

    return res.status(201).json({ ok: true, data: toClient(result.rows[0]) });

  } catch (err) {
    console.error('❌ Error creando producto:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── PUT /api/products/:id — admin ──────────────────────────────────────────────
const updateProduct = async (req, res) => {
  const {
    type, sysName, title, tag, description,
    features, to, cta, imageUrl, available, sortOrder,
    downloadUrl, platform, images,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products SET
         type         = COALESCE($1, type),
         sys_name     = COALESCE($2, sys_name),
         title        = COALESCE($3, title),
         tag          = COALESCE($4, tag),
         description  = COALESCE($5, description),
         features     = COALESCE($6, features),
         link_to      = $7,
         cta_label    = COALESCE($8, cta_label),
         image_url    = $9,
         available    = COALESCE($10, available),
         sort_order   = COALESCE($11, sort_order),
         download_url = $12,
         platform     = COALESCE($13, platform),
         images       = COALESCE($14, images)
       WHERE id = $15
       RETURNING *`,
      [
        type, sysName, title, tag, description,
        features ? JSON.stringify(features) : null,
        to, cta, imageUrl, available, sortOrder,
        downloadUrl, platform,
        images ? JSON.stringify(images) : null,
        req.params.id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'Producto no encontrado.' });
    }

    return res.json({ ok: true, data: toClient(result.rows[0]) });

  } catch (err) {
    console.error('❌ Error actualizando producto:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── DELETE /api/products/:id — admin ───────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'Producto no encontrado.' });
    }
    return res.json({ ok: true, message: 'Producto eliminado.' });
  } catch (err) {
    console.error('❌ Error eliminando producto:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
