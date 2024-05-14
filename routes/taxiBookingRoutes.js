// taxiBookingRoutes.js
const express = require('express');
const router = express.Router();
const taxiBookingController = require('../controllers/taxiBookingController');

router.post('/', taxiBookingController.bookTaxi);

module.exports = router;
