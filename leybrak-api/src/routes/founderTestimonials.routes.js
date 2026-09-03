const { Router } = require('express');
const {
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
} = require('../controllers/founderTestimonials.controller');
const { founderTestimonialRules, validate } = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth');

const router = Router();

// Público — lo usa la página /portafolio
router.get('/', getTestimonials);

// Resto de operaciones — solo el admin
router.post('/',      requireAdmin, founderTestimonialRules, validate, createTestimonial);
router.put('/:id',    requireAdmin, founderTestimonialRules, validate, updateTestimonial);
router.delete('/:id', requireAdmin, deleteTestimonial);

module.exports = router;
