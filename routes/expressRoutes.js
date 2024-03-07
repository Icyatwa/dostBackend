// const express = require('express');
// const router = express.Router();
// const expressController = require('../controllers/expressController');

// router.post('/', expressController.createRide);
// router.get('/', expressController.getAllRides);
// router.get('/express/:rideId', expressController.getRideById);
// router.get('/:rideId', expressController.getRideById);

// module.exports = router;
// // Corrected route path

// module.exports = router;


const express = require('express');
const router = express.Router();
const expressController = require('../controllers/expressController');

// Create a new ride
router.post('/', expressController.createRide);

router.get('/', expressController.getAllRides);

router.get('/express/:rideId', expressController.getRideById);

router.get('/:rideId', expressController.getRideById);

// Update a ride by ID
router.put('/:rideId', expressController.updateRideById);

// Delete a ride by ID
router.delete('/:rideId', expressController.deleteRideById);

module.exports = router;
