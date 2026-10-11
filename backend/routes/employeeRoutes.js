
const express = require('express');
const router = express.Router();
const controller = require('../controllers/employeeController');
const requireAuth = require('../middlewares/authMiddleware');
const requireManager = require('../middlewares/requireManager');

// Any logged-in employee can view employee records.
router.get('/', requireAuth, controller.getAllEmployees);
router.get('/:id', requireAuth, controller.getEmployeeById);

// Only a Manager can create, edit, or delete employee records.
router.post('/', requireAuth, requireManager, controller.createEmployee);
router.put('/:id', requireAuth, requireManager, controller.updateEmployee);
router.delete('/:id', requireAuth, requireManager, controller.deleteEmployee);

module.exports = router;
