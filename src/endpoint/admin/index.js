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
router.get('/team/matching/fail/male', checkUser, checkAdmin, require('./adminTeamMatchingFailMale'));
router.get('/team/matching/fail/female', checkUser, checkAdmin, require('./adminTeamMatchingFailFemale'));
router.post('/team/match', checkUser, checkAdmin, require('./adminTeamMatchPOST'));
router.post('/close/matching', checkUser, checkAdmin, require('./adminCloseMatchingPOST'));
router.post('/close/team', checkUser, checkAdmin, require('./adminCloseTeamPOST'));
router.put('/apply/status', checkUser, checkAdmin, require('./adminApplyStatusPUT'));
router.post('/team/fail', checkUser, checkAdmin, require('./adminTeamFail'));

module.exports = router;
