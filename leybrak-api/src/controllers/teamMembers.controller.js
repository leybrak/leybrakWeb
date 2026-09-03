const pool = require('../db/pool');

const toClient = (row) => ({
  id:          row.id,
  name:        row.name,
  role:        row.role,
  photoUrl:    row.photo_url,
  bio:         row.bio,
  linkedinUrl: row.linkedin_url,
  githubUrl:   row.github_url,
  isFounder:   row.is_founder,
  sortOrder:   row.sort_order,
});

// ── GET /api/team-members — público, lo consume /nosotros ─────────────────────
const getTeamMembers = async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team_members ORDER BY sort_order ASC, created_at ASC');
    return res.json({ ok: true, data: result.rows.map(toClient) });
  } catch (err) {
    console.error('❌ Error obteniendo equipo:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── POST /api/team-members — admin ─────────────────────────────────────────────
const createTeamMember = async (req, res) => {
  const {
    name, role = '', photoUrl = null, bio = '',
    linkedinUrl = null, githubUrl = null, isFounder = false, sortOrder = 0,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO team_members (name, role, photo_url, bio, linkedin_url, github_url, is_founder, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, role, photoUrl, bio, linkedinUrl, githubUrl, isFounder, sortOrder]
    );
    return res.status(201).json({ ok: true, data: toClient(result.rows[0]) });
  } catch (err) {
    console.error('❌ Error creando miembro del equipo:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── PUT /api/team-members/:id — admin ──────────────────────────────────────────
const updateTeamMember = async (req, res) => {
  const { name, role, photoUrl, bio, linkedinUrl, githubUrl, isFounder, sortOrder } = req.body;

  try {
    const result = await pool.query(
      `UPDATE team_members SET
         name         = COALESCE($1, name),
         role         = COALESCE($2, role),
         photo_url    = $3,
         bio          = COALESCE($4, bio),
         linkedin_url = $5,
         github_url   = $6,
         is_founder   = COALESCE($7, is_founder),
         sort_order   = COALESCE($8, sort_order)
       WHERE id = $9
       RETURNING *`,
      [name, role, photoUrl, bio, linkedinUrl, githubUrl, isFounder, sortOrder, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'No encontrado.' });
    }
    return res.json({ ok: true, data: toClient(result.rows[0]) });
  } catch (err) {
    console.error('❌ Error actualizando miembro del equipo:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── DELETE /api/team-members/:id — admin ───────────────────────────────────────
const deleteTeamMember = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM team_members WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'No encontrado.' });
    }
    return res.json({ ok: true, message: 'Eliminado.' });
  } catch (err) {
    console.error('❌ Error eliminando miembro del equipo:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

module.exports = { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember };
