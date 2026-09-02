const { Router } = require('express');
const { createLead, getLeads, updateEstado } = require('../controllers/leads.controller');
const { leadRules, validate } = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth');

const router = Router();

// Crear lead (formulario del sitio) — público
router.post('/',    leadRules, validate, createLead);

// Listar leads — solo el admin
router.get('/',     requireAdmin, getLeads);

// Actualizar estado de un lead — solo el admin
router.patch('/:id/estado', requireAdmin, updateEstado);

module.exports = router;
