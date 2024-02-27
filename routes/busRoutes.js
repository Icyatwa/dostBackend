
const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
router.post('/', busController.createBus);
router.get('/', busController.getAllBuses);
// router.get('/bus/:busId', busController.getBusById);
router.get('/:busId', busController.getBusById);

module.exports = router;