const { Router } = require('express');
const {
  getCertifications, createCertification, updateCertification, deleteCertification,
} = require('../controllers/founderCertifications.controller');
const { founderCertificationRules, validate } = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth');

const router = Router();

// Público — lo usa la página /portafolio
router.get('/', getCertifications);

// Resto de operaciones — solo el admin
router.post('/',      requireAdmin, founderCertificationRules, validate, createCertification);
router.put('/:id',    requireAdmin, founderCertificationRules, validate, updateCertification);
router.delete('/:id', requireAdmin, deleteCertification);

module.exports = router;
