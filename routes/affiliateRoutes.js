const express = require('express');
const router = express.Router();
const { logClick } = require('../controllers/affiliateController');

// Public Affiliate Click Tracking Route
router.post('/', logClick);

module.exports = router;
