const express = require('express');
const router = express.Router();
const { getVideos } = require('../controllers/videoController');

// Public Video Routes
router.get('/', getVideos);

module.exports = router;
