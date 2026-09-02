const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../db/pool');

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email = '', password = '' } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash FROM admin_users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    const admin = result.rows[0];
    const validPassword = admin ? await bcrypt.compare(password, admin.password_hash) : false;

    if (!admin || !validPassword) {
      return res.status(401).json({ ok: false, message: 'Correo o contraseña incorrectos.' });
    }

    const token = jwt.sign({ sub: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '12h' });

    return res.json({ ok: true, data: { token, email: admin.email } });

  } catch (err) {
    console.error('❌ Error en login:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────────────────────
const me = (req, res) => {
  return res.json({ ok: true, data: { email: req.admin.email } });
};

// ── PATCH /api/auth/password ───────────────────────────────────────────────────
const changePassword = async (req, res) => {
  const { currentPassword = '', newPassword = '' } = req.body;

  if (newPassword.length < 8) {
    return res.status(422).json({ ok: false, message: 'La nueva contraseña debe tener al menos 8 caracteres.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, password_hash FROM admin_users WHERE id = $1',
      [req.admin.sub]
    );
    const admin = result.rows[0];

    if (!admin || !(await bcrypt.compare(currentPassword, admin.password_hash))) {
      return res.status(401).json({ ok: false, message: 'La contraseña actual no es correcta.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE admin_users SET password_hash = $1 WHERE id = $2', [newHash, admin.id]);

    return res.json({ ok: true, message: 'Contraseña actualizada correctamente.' });

  } catch (err) {
    console.error('❌ Error cambiando contraseña:', err.message);
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
};

module.exports = { login, me, changePassword };
