// cabDetails.js

const express = require('express');
const router = express.Router();
const cabDetailsController = require('../controllers/cabDetailsController');

router.get('/', cabDetailsController.getCabDetails);
router.get('/:id', cabDetailsController.getCabDetailsById);
module.exports = router;
