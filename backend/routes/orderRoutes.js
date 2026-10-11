
const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderController');
const requireAuth = require('../middlewares/authMiddleware');

router.post('/', requireAuth, controller.createOrder);
router.get('/:id', requireAuth, controller.getOrderById);

module.exports = router;
