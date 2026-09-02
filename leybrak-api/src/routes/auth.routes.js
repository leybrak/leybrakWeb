const { Router } = require('express');
const rateLimit  = require('express-rate-limit');
const { login, me, changePassword } = require('../controllers/auth.controller');
const { requireAdmin } = require('../middleware/auth');

const router = Router();

// Limita intentos de login para dificultar fuerza bruta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { ok: false, message: 'Demasiados intentos. Intenta en unos minutos.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

router.post('/login', loginLimiter, login);
router.get('/me', requireAdmin, me);
router.patch('/password', requireAdmin, changePassword);

module.exports = router;
