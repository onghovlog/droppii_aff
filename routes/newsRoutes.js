const express = require('express');
const router = express.Router();
const { getNews, getNewsBySlug } = require('../controllers/newsController');

// Public News Routes
router.get('/', getNews);
router.get('/:slug', getNewsBySlug);

module.exports = router;
