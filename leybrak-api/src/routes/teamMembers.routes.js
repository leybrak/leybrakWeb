const { Router } = require('express');
const {
  getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember,
} = require('../controllers/teamMembers.controller');
const { teamMemberRules, validate } = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth');

const router = Router();

// Público — lo usa la página /nosotros
router.get('/', getTeamMembers);

// Resto de operaciones — solo el admin
router.post('/',      requireAdmin, teamMemberRules, validate, createTeamMember);
router.put('/:id',    requireAdmin, teamMemberRules, validate, updateTeamMember);
router.delete('/:id', requireAdmin, deleteTeamMember);

module.exports = router;
