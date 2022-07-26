const express = require('express');
const router = express.Router();

router.use('/user', require('./user'));
router.use('/service', require('./service'));

module.exports = router;
