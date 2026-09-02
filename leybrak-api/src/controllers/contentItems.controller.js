const pool = require('../db/pool');

// Fábrica de controlador CRUD simple para tablas con forma
// (id, title, description, sort_order) — usada por "services" y "about_values".
// El nombre de tabla nunca viene del cliente, así que es seguro interpolarlo.
const createContentItemsController = (table) => {
  const toClient = (row) => ({
    id:          row.id,
    title:       row.title,
    description: row.description,
    sortOrder:   row.sort_order,
  });

  const getItems = async (_req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${table} ORDER BY sort_order ASC, created_at ASC`);
      return res.json({ ok: true, data: result.rows.map(toClient) });
    } catch (err) {
      console.error(`❌ Error obteniendo ${table}:`, err.message);
      return res.status(500).json({ ok: false, message: 'Error interno.' });
    }
  };

  const createItem = async (req, res) => {
    const { title, description = '', sortOrder = 0 } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO ${table} (title, description, sort_order) VALUES ($1, $2, $3) RETURNING *`,
        [title, description, sortOrder]
      );
      return res.status(201).json({ ok: true, data: toClient(result.rows[0]) });
    } catch (err) {
      console.error(`❌ Error creando en ${table}:`, err.message);
      return res.status(500).json({ ok: false, message: 'Error interno.' });
    }
  };

  const updateItem = async (req, res) => {
    const { title, description, sortOrder } = req.body;
    try {
      const result = await pool.query(
        `UPDATE ${table} SET
           title       = COALESCE($1, title),
           description = COALESCE($2, description),
           sort_order  = COALESCE($3, sort_order)
         WHERE id = $4
         RETURNING *`,
        [title, description, sortOrder, req.params.id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ ok: false, message: 'No encontrado.' });
      }
      return res.json({ ok: true, data: toClient(result.rows[0]) });
    } catch (err) {
      console.error(`❌ Error actualizando en ${table}:`, err.message);
      return res.status(500).json({ ok: false, message: 'Error interno.' });
    }
  };

  const deleteItem = async (req, res) => {
    try {
      const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [req.params.id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ ok: false, message: 'No encontrado.' });
      }
      return res.json({ ok: true, message: 'Eliminado.' });
    } catch (err) {
      console.error(`❌ Error eliminando en ${table}:`, err.message);
      return res.status(500).json({ ok: false, message: 'Error interno.' });
    }
  };

  return { getItems, createItem, updateItem, deleteItem };
};

module.exports = { createContentItemsController };
