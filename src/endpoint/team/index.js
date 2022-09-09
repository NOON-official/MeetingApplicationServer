const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

router.post('/', checkUser, require('./teamPOST'));
router.get('/ourteam-id/:userId', checkUser, require('./teamOurteamIdUserIdGET'));

module.exports = router;
