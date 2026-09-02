const jwt = require('jsonwebtoken');

// ── Protege rutas: exige un JWT válido emitido por /api/auth/login ───────────
const requireAdmin = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ ok: false, message: 'No autorizado.' });
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ ok: false, message: 'Sesión inválida o expirada.' });
  }
};

module.exports = { requireAdmin };
