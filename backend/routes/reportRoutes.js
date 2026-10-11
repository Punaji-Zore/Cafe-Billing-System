
const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportController');
const requireAuth = require('../middlewares/authMiddleware');

router.get('/sales', requireAuth, controller.getSalesReport);

module.exports = router;
