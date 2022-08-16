const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

router.post('/ourteam', checkUser, require('./userOurteamPOST'));
router.post('/preference', require('./userPreferencePOST'));

module.exports = router;
