
const express = require('express');
const router = express.Router();
const controller = require('../controllers/customerController');
const requireAuth = require('../middlewares/authMiddleware');

router.get('/', requireAuth, controller.getAllCustomers);
router.get('/:id', requireAuth, controller.getCustomerById);
router.post('/', requireAuth, controller.createCustomer);
router.put('/:id', requireAuth, controller.updateCustomer);
router.delete('/:id', requireAuth, controller.deleteCustomer);

module.exports = router;
