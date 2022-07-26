const express = require('express');
const router = express.Router();

router.post('/ourteam', require('./userOurteamPOST'));

module.exports = router;
