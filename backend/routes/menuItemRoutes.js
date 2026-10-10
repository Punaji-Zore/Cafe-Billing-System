const express = require('express');
const router = express.Router();
const controller = require('../controllers/menuItemController');
const requireAuth = require('../middlewares/authMiddleware');

router.get('/', controller.getAllItems);
router.get('/:id', controller.getItemById);
router.post('/', requireAuth, controller.createItem);
router.put('/:id', requireAuth, controller.updateItem);
router.delete('/:id', requireAuth, controller.deleteItem);

module.exports = router;
