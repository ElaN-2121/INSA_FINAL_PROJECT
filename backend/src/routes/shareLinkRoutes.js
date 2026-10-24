const express = require('express');
const shareLinkController = require('../controllers/shareLinkController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.post('/', authenticate, authorize('STUDENT'), shareLinkController.generateLink);
router.get('/verify/:token', shareLinkController.verifyLink);
router.get('/mine', authenticate, authorize('STUDENT'), shareLinkController.listMyLinks);
router.delete('/:linkId', authenticate, authorize('STUDENT'), shareLinkController.revokeLink);

module.exports = router;
