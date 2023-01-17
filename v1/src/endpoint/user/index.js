const express = require('express');
const router = express.Router();
const { checkUser } = require('../../middlewares/auth');

router.post('/phone', checkUser, require('./userPhonePOST(deprecated)'));
router.get('/:userId', checkUser, require('./userUserIdGET'));
router.post('/privacy', checkUser, require('./userPrivacyPOST'));

module.exports = router;
