const express = require('express');
const router = express.Router();

router.get('/apply/status', require('./serviceApplyStatusGET'));
router.get('/count/team', require('./serviceCountTeamGET'));

module.exports = router;
