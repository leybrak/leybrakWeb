const { Router } = require('express');
const {
  getProjects, createProject, updateProject, deleteProject,
} = require('../controllers/founderProjects.controller');
const { founderProjectRules, validate } = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth');

const router = Router();

// Público — lo usa la página /portafolio
router.get('/', getProjects);

// Resto de operaciones — solo el admin
router.post('/',      requireAdmin, founderProjectRules, validate, createProject);
router.put('/:id',    requireAdmin, founderProjectRules, validate, updateProject);
router.delete('/:id', requireAdmin, deleteProject);

module.exports = router;
