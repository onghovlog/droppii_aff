const express = require('express');
const router = express.Router();
const { createPartner } = require('../controllers/partnerController');

// Public Partner Registration Route
router.post('/', createPartner);

module.exports = router;
