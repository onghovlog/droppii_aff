const express = require('express');
const router = express.Router();
const { getSettings } = require('../controllers/settingController');

// Public Settings Route
router.get('/', getSettings);

module.exports = router;
