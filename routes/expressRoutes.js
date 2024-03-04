
// const express = require('express');
// const router = express.Router();
// const expressController = require('../controllers/expressController');
// router.post('/', expressController.createRide);
// router.get('/', expressController.getAllRides);
// router.get('/:expressId', expressController.getRidesByDriverId);
// router.get('express/:expressId', expressController.getRideById);
// module.exports = router;

const express = require('express');
const router = express.Router();
const expressController = require('../controllers/expressController');

router.post('/', expressController.createRide);
router.get('/', expressController.getAllRides);
router.get('/express/:rideId', expressController.getRideById);
router.get('/:rideId', expressController.getRideById);

module.exports = router;
// Corrected route path

module.exports = router;
