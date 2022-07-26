const express = require('express');
const router = express.Router();

router.get('/count/weekly', require('./serviceCountWeeklyGET'));

module.exports = router;
