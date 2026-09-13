const express = require('express');
const router = express.Router();
const { createSubscriber } = require('../controllers/subscriberController');

// Public Subscriber Route
router.post('/', createSubscriber);

module.exports = router;
