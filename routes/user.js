// routes/user.js
const express = require('express');
const router = express.Router();
const { loginUser, signupUser } = require('../controllers/userController');
const requireAuth = require('../middleware/requireAuth');

router.post('/login', loginUser);
router.post('/signup', signupUser);

module.exports = router;
