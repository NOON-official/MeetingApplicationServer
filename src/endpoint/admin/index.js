const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');
const { checkAdmin } = require('../../middlewares/admin');

router.get('/team/male/2', checkUser, checkAdmin, require('./adminTeamMale2GET'));
router.get('/team/male/3', checkUser, checkAdmin, require('./adminTeamMale3GET'));
router.get('/team/female/2', checkUser, checkAdmin, require('./adminTeamFemale2GET'));
router.get('/team/female/3', checkUser, checkAdmin, require('./adminTeamFemale3GET'));
router.get('/team/matching/success/male', checkUser, checkAdmin, require('./adminTeamMatchingSuccessMale'));
router.get('/team/matching/success/female', checkUser, checkAdmin, require('./adminTeamMatchingSuccessFemale'));

module.exports = router;
