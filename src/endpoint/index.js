const express = require('express');
const router = express.Router();

router.use('/service', require('./service'));
router.use('/auth', require('./auth'));
router.use('/user', require('./user'));

module.exports = router;
