const express = require('express');
const router = express.Router();

router.post('/example', require('./example'));

module.exports = router;
