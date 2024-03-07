const express = require('express');
const router = express.Router();
const expressController = require('../controllers/expressController');

router.post('/', expressController.createRide);

router.get('/', expressController.getAllRides);

router.get('/express/:rideId', expressController.getRideById);

router.get('/:rideId', expressController.getRideById);

router.put('/:rideId', expressController.updateRideById);

router.delete('/:rideId', expressController.deleteRideById);

module.exports = router;
