const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

router.post('/', checkUser, require('./teamPOST'));
router.put('/', checkUser, require('./teamPUT'));
router.get('/ourteam-id/:userId', checkUser, require('./teamOurteamIdUserIdGET'));
router.get('/partner-team-id/:ourteamId', checkUser, require('./teamPartnerTeamIdOurteamIdGET.js'));
router.get('/:teamId', checkUser, require('./teamTeamIdGET.js'));
router.get('/status/:ourteamId', checkUser, require('./teamStatusOurteamIdGET.js'));
router.get('/result/:ourteamId', checkUser, require('./teamResultOurteamIdGET.js'));

module.exports = router;
