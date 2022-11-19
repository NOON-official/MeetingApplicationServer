const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');
const { checkAdmin } = require('../../middlewares/admin');

router.get('/team/male/2/unchecked', checkUser, checkAdmin, require('./adminTeamMale2UncheckedGET'));
router.get('/team/male/3/unchecked', checkUser, checkAdmin, require('./adminTeamMale3UncheckedGET'));
router.get('/team/female/2/unchecked', checkUser, checkAdmin, require('./adminTeamFemale2UncheckedGET'));
router.get('/team/female/3/unchecked', checkUser, checkAdmin, require('./adminTeamFemale3UncheckedGET'));
router.get('/team/matching/success/male', checkUser, checkAdmin, require('./adminTeamMatchingSuccessMaleGET'));
router.get('/team/matching/success/female', checkUser, checkAdmin, require('./adminTeamMatchingSuccessFemaleGET'));
router.get('/team/matching/fail/male', checkUser, checkAdmin, require('./adminTeamMatchingFailMaleGET'));
router.get('/team/matching/fail/female', checkUser, checkAdmin, require('./adminTeamMatchingFailFemaleGET'));
router.post('/team/match', checkUser, checkAdmin, require('./adminTeamMatchPOST'));
router.post('/close/matching', checkUser, checkAdmin, require('./adminCloseMatchingPOST'));
router.post('/close/team', checkUser, checkAdmin, require('./adminCloseTeamPOST'));
router.put('/apply/status', checkUser, checkAdmin, require('./adminApplyStatusPUT'));
router.post('/team/fail', checkUser, checkAdmin, require('./adminTeamFailPOST'));
router.get('/apply/status', checkUser, checkAdmin, require('./adminApplyStatusGET'));
router.put('/team/match', checkUser, checkAdmin, require('./adminTeamMatchPUT'));
router.put('/team/fail', checkUser, checkAdmin, require('./adminTeamFailPUT'));

module.exports = router;
