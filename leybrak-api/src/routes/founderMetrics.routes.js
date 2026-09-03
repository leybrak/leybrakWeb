const { Router } = require('express');
const {
  getMetrics, createMetric, updateMetric, deleteMetric,
} = require('../controllers/founderMetrics.controller');
const { founderMetricRules, validate } = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth');

const router = Router();

// Público — lo usa la página /portafolio
router.get('/', getMetrics);

// Resto de operaciones — solo el admin
router.post('/',      requireAdmin, founderMetricRules, validate, createMetric);
router.put('/:id',    requireAdmin, founderMetricRules, validate, updateMetric);
router.delete('/:id', requireAdmin, deleteMetric);

module.exports = router;
