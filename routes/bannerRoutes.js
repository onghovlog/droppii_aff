const express = require('express');
const router = express.Router();
const { getBanners } = require('../controllers/bannerController');

// Public Banner Routes
router.get('/', getBanners);

module.exports = router;
