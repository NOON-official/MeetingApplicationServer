const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

router.post('/phone', checkUser, require('./userPhonePOST'));
router.get('/:userId', checkUser, require('./userUserIdGET'));
router.post('/ourteam', checkUser, require('./userOurteamPOST'));
router.post('/preference', checkUser, require('./userPreferencePOST'));

module.exports = router;
