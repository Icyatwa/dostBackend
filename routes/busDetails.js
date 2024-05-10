// busDetails.js

const express = require('express');
const router = express.Router();
const busDetailsController = require('../controllers/busDetailsController');

router.get('/', busDetailsController.getBusDetails);
router.get('/:id', busDetailsController.getBusDetailsById);
module.exports = router;
