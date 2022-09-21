const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

router.get('/kakao/callback', require('./authKakaoCallbackGET'));
router.delete('/account/:userId', checkUser, require('./authAccountUserIdDELETE'));
router.post('/refresh', require('./authRefreshPOST'));
router.get('/signout/:userId', checkUser, require('./authSignoutUserIdGET'));

module.exports = router;
