
const express = require('express');
const router = express.Router();
const controller = require('../controllers/paymentController');
const requireAuth = require('../middlewares/authMiddleware');

router.post('/', requireAuth, controller.createPayment);
router.get('/:id', requireAuth, controller.getPaymentById);

module.exports = router;
