const { Router } = require('express');
const { getPlans, createPlan, updatePlan, deletePlan } = require('../controllers/plans.controller');
const { planRules, validate } = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth');

const router = Router();

// Público — lo usa la web para pintar los planes de un producto
router.get('/', getPlans);

// Resto de operaciones — solo el admin
router.post('/',      requireAdmin, planRules, validate, createPlan);
router.put('/:id',    requireAdmin, planRules, validate, updatePlan);
router.delete('/:id', requireAdmin, deletePlan);

module.exports = router;
