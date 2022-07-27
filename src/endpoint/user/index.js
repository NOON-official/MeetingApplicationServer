const express = require('express');
const router = express.Router();

router.post('/ourteam', require('./userOurteamPOST'));
router.post('/preference', require('./userPreferencePOST'));

module.exports = router;
