const { Router } = require('express');
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
} = require('../controllers/products.controller');
const { productRules, validate } = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth');

const router = Router();

// Público — lo usa la web para pintar los productos/proyectos
router.get('/', getProducts);

// Resto de operaciones — solo el admin
router.get('/:id',    requireAdmin, getProduct);
router.post('/',      requireAdmin, productRules, validate, createProduct);
router.put('/:id',    requireAdmin, productRules, validate, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

module.exports = router;
