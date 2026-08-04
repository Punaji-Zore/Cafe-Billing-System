const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderController');

// TODO: replace with real routes per API contract (Section 3 of project plan doc)
router.all('*', controller.placeholder);

module.exports = router;
