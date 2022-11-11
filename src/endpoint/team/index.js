const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

router.post('/', checkUser, require('./teamPOST'));
router.put('/', checkUser, require('./teamPUT'));
router.get('/ourteam-id/:userId', checkUser, require('./teamOurteamIdUserIdGET'));
router.get('/partner-team-id/:ourteamId', checkUser, require('./teamPartnerTeamIdOurteamIdGET'));
router.get('/:teamId', checkUser, require('./teamTeamIdGET'));
router.get('/status/:ourteamId', checkUser, require('./teamStatusOurteamIdGET(deprecated)'));
router.get('/result/:ourteamId', checkUser, require('./teamResultOurteamIdGET'));
router.put('/reapply', checkUser, require('./teamReapplyPUT'));
router.get('/page/:ourteamId', checkUser, require('./teamPageOurteamIdGET'));

module.exports = router;
