const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

router.get('/ourteam-id/:userId', checkUser, require('./teamOurteamIdUserIdGET'));

module.exports = router;
