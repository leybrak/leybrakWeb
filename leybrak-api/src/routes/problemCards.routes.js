const { Router } = require('express');
const {
  getProblemCards, createProblemCard, updateProblemCard, deleteProblemCard,
} = require('../controllers/problemCards.controller');
const { problemCardRules, validate } = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth');

const router = Router();

// Público — lo usa la sección "¿Te suena familiar?" de Inicio
router.get('/', getProblemCards);

// Resto de operaciones — solo el admin
router.post('/',      requireAdmin, problemCardRules, validate, createProblemCard);
router.put('/:id',    requireAdmin, problemCardRules, validate, updateProblemCard);
router.delete('/:id', requireAdmin, deleteProblemCard);

module.exports = router;
