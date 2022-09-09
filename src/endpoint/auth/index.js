const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

router.get('/kakao/callback', require('./authKakaoCallbackGET'));
router.delete('/account/:userId', checkUser, require('./authAccountUserIdDELETE'));
router.post('/refresh', require('./authRefreshPOST'));
router.post('/phone', checkUser, require('./authPhonePOST'));

module.exports = router;
