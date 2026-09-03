const { Router } = require('express');
const {
  getExperience, createExperience, updateExperience, deleteExperience,
} = require('../controllers/founderExperience.controller');
const { founderExperienceRules, validate } = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth');

const router = Router();

// Público — lo usa la página /portafolio
router.get('/', getExperience);

// Resto de operaciones — solo el admin
router.post('/',      requireAdmin, founderExperienceRules, validate, createExperience);
router.put('/:id',    requireAdmin, founderExperienceRules, validate, updateExperience);
router.delete('/:id', requireAdmin, deleteExperience);

module.exports = router;
