// const express = require('express');
// const router = express.Router();
// const busBookingController = require('../controllers/busBookingController');
// router.post('/create', busBookingController.createBooking);
// router.get('/booking/:rideId', busBookingController.getBookingsByRideId);
// router.delete('/:bookingId', busBookingController.cancelBooking);

// module.exports = router;





// bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/busBookingController');

router.post('/', bookingController.createBooking);
router.get('/:rideId', bookingController.getBookingsForRide);

module.exports = router;
