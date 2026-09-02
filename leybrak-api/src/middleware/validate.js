const { body, validationResult } = require('express-validator');

// ── Reglas de validación ──────────────────────────────────────────────────────
const leadRules = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 120 }).withMessage('El nombre debe tener entre 2 y 120 caracteres'),

  body('telefono')
    .trim()
    .notEmpty().withMessage('El teléfono es requerido')
    .matches(/^[+\d\s\-()]{7,20}$/).withMessage('Teléfono inválido'),

  body('servicio')
    .optional()
    .isIn(['saas', 'custom', 'data_vision', 'general', ''])
    .withMessage('Servicio no válido'),

  body('mensaje')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('El mensaje no puede superar los 1000 caracteres'),

  body('origen')
    .optional()
    .isIn(['formulario', 'whatsapp'])
    .withMessage('Origen no válido'),
];

// ── Reglas para crear/editar productos y proyectos ────────────────────────────
const productRules = [
  body('type')
    .optional()
    .isIn(['producto', 'proyecto']).withMessage('Tipo no válido'),

  body('title')
    .trim()
    .notEmpty().withMessage('El título es requerido')
    .isLength({ max: 160 }).withMessage('El título no puede superar los 160 caracteres'),

  body('sysName')
    .optional()
    .trim()
    .isLength({ max: 60 }).withMessage('El nombre de sistema no puede superar los 60 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('La descripción no puede superar los 2000 caracteres'),

  body('features')
    .optional()
    .isArray().withMessage('Las características deben ser una lista'),

  body('available')
    .optional()
    .isBoolean().withMessage('Disponible debe ser verdadero o falso'),

  body('sortOrder')
    .optional()
    .isInt().withMessage('El orden debe ser un número'),

  body('platform')
    .optional()
    .isIn(['mobile', 'desktop', 'both']).withMessage('Plataforma no válida'),

  body('images')
    .optional()
    .isArray().withMessage('Las imágenes deben ser una lista'),
];

// ── Reglas para crear/editar planes de precio ─────────────────────────────────
const planRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre del plan es requerido')
    .isLength({ max: 80 }).withMessage('El nombre no puede superar los 80 caracteres'),

  body('price')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),

  body('featured')
    .optional()
    .isBoolean().withMessage('Destacado debe ser verdadero o falso'),

  body('features')
    .optional()
    .isArray().withMessage('Las características deben ser una lista'),

  body('sortOrder')
    .optional()
    .isInt().withMessage('El orden debe ser un número'),
];

// ── Reglas para crear/editar servicios y valores de "nosotros" ────────────────
const contentItemRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('El título es requerido')
    .isLength({ max: 160 }).withMessage('El título no puede superar los 160 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('La descripción no puede superar los 2000 caracteres'),

  body('sortOrder')
    .optional()
    .isInt().withMessage('El orden debe ser un número'),
];

// ── Middleware que verifica los resultados ────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      ok: false,
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { leadRules, productRules, planRules, contentItemRules, validate };
