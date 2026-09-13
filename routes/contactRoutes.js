const express = require('express');
const router = express.Router();
const { createContact } = require('../controllers/contactController');

// Public Contact Route
router.post('/', createContact);

module.exports = router;
