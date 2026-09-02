const { Router } = require('express');
const { getSettings, updateSettings } = require('../controllers/settings.controller');
const { requireAdmin } = require('../middleware/auth');

const router = Router();

// Público — lo usa la web para pintar el WhatsApp, correo, redes, etc.
router.get('/', getSettings);

// Solo el admin puede editar la configuración
router.put('/', requireAdmin, updateSettings);

module.exports = router;
