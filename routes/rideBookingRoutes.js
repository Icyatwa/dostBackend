// rideBookingRoutes.js
const express = require('express');
const router = express.Router();
const rideBookingController = require('../controllers/rideBookingController');

router.post('/', rideBookingController.bookRide);
router.get('/booking/:postId', rideBookingController.getBookingsByPostId);

module.exports = router;
