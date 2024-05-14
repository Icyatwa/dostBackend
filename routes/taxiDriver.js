// routes/driver.js
const express = require('express');
const router = express.Router();
const { loginDriver, signupDriver } = require('../controllers/taxiDriverController');
const requireAuth = require('../middleware/taxiRequireAuth');

router.post('/login', loginDriver);
router.post('/signup', signupDriver);

module.exports = router;
