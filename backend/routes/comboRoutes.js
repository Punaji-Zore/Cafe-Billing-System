const express = require('express');
const router = express.Router();
const controller = require('../controllers/comboController');
const requireAuth = require('../middlewares/authMiddleware');

router.get('/', controller.getAllCombos);
router.get('/:id', controller.getComboById);
router.post('/', requireAuth, controller.createCombo);
router.put('/:id', requireAuth, controller.updateCombo);
router.delete('/:id', requireAuth, controller.deleteCombo);

module.exports = router;
