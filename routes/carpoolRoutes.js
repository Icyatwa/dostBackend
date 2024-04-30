const express = require('express');
const router = express.Router();
const carpoolController = require('../controllers/carpoolController');
router.post('/', carpoolController.createCarpool);
router.get('/', carpoolController.getAllCarpools);
router.get('/:driverId', carpoolController.getCarpoolsByDriverId);
router.get('/carpool/:carpoolId', carpoolController.getCarpoolById);
router.put('/:carpoolId', carpoolController.updateCarpool); // Update carpool
router.delete('/:carpoolId', carpoolController.deleteCarpool); // Delete carpool
module.exports = router;
