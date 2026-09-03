const pool = require('../db/pool');

const toClient = (row) => ({
  id:           row.id,
  title:        row.title,
  description:  row.description,
  imageUrl:     row.image_url,
  technologies: row.technologies,
  githubLink:   row.github_link,
  liveLink:     row.live_link,
  sortOrder:    row.sort_order,
});

// ── GET /api/founder-projects — público, lo consume /portafolio ───────────────
const getProjects = async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM founder_projects ORDER BY sort_order ASC, created_at ASC');
    return res.json({ ok: true, data: result.rows.map(toClient) });
  } catch (err) {
    console.error('❌ Error obteniendo proyectos del portafolio:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── POST /api/founder-projects — admin ─────────────────────────────────────────
const createProject = async (req, res) => {
  const {
    title, description = '', imageUrl = null, technologies = [],
    githubLink = null, liveLink = null, sortOrder = 0,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO founder_projects (title, description, image_url, technologies, github_link, live_link, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, imageUrl, JSON.stringify(technologies), githubLink, liveLink, sortOrder]
    );
    return res.status(201).json({ ok: true, data: toClient(result.rows[0]) });
  } catch (err) {
    console.error('❌ Error creando proyecto del portafolio:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── PUT /api/founder-projects/:id — admin ──────────────────────────────────────
const updateProject = async (req, res) => {
  const { title, description, imageUrl, technologies, githubLink, liveLink, sortOrder } = req.body;

  try {
    const result = await pool.query(
      `UPDATE founder_projects SET
         title        = COALESCE($1, title),
         description  = COALESCE($2, description),
         image_url    = $3,
         technologies = COALESCE($4, technologies),
         github_link  = $5,
         live_link    = $6,
         sort_order   = COALESCE($7, sort_order)
       WHERE id = $8
       RETURNING *`,
      [
        title, description, imageUrl,
        technologies ? JSON.stringify(technologies) : null,
        githubLink, liveLink, sortOrder, req.params.id,
      ]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'No encontrado.' });
    }
    return res.json({ ok: true, data: toClient(result.rows[0]) });
  } catch (err) {
    console.error('❌ Error actualizando proyecto del portafolio:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── DELETE /api/founder-projects/:id — admin ───────────────────────────────────
const deleteProject = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM founder_projects WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'No encontrado.' });
    }
    return res.json({ ok: true, message: 'Eliminado.' });
  } catch (err) {
    console.error('❌ Error eliminando proyecto del portafolio:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };
