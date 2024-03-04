const express = require('express');
const router = express.Router();
const expressAuthCtn = require('../controllers/expressAuthCtn');

// Signup route
router.post('/signup', expressAuthCtn.signup);

// Login route
router.post('/login', expressAuthCtn.login);

module.exports = router;
