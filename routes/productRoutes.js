const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug } = require('../controllers/productController');

// Public Product Routes
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

module.exports = router;
