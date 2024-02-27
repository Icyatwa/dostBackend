// routes/rideRoutes.js
const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
router.post('/', rideController.createRide);
router.get('/', rideController.getAllRides);
router.get('/:driverId', rideController.getRidesByDriverId);
router.get('/ride/:rideId', rideController.getRideById);
module.exports = router;