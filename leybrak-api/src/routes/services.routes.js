const { Router } = require('express');
const { createContentItemsController } = require('../controllers/contentItems.controller');
const { contentItemRules, validate } = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth');

const { getItems, createItem, updateItem, deleteItem } = createContentItemsController('services');

const router = Router();

// Público — lo usa la página /servicios
router.get('/', getItems);

// Resto de operaciones — solo el admin
router.post('/',      requireAdmin, contentItemRules, validate, createItem);
router.put('/:id',    requireAdmin, contentItemRules, validate, updateItem);
router.delete('/:id', requireAdmin, deleteItem);

module.exports = router;
