const express = require('express');
const router = express.Router();
const { tamperingDemo, rogueIssuerDemo, revocationDemo } = require('../controllers/securityController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All security demo routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

router.post('/demo/tamper/:credentialId', tamperingDemo);
router.post('/demo/rogue-issuer', rogueIssuerDemo);
router.post('/demo/revocation/:credentialId', revocationDemo);

module.exports = router;
