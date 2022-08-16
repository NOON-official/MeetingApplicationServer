const express = require('express');
const router = express.Router();

router.get('/count/team', require('./serviceCountTeamGET'));

module.exports = router;
