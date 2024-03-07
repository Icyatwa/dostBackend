const express = require('express');
const router = express.Router();
const expressAuthCtn = require('../controllers/expressAuthCtn');

router.post('/signup', expressAuthCtn.signup);

router.post('/login', expressAuthCtn.login);

module.exports = router;
