const express = require('express');
const credentialController = require('../controllers/credentialController');
const authenticate = require('../middleware/authenticate');
const authenticateApiKey = require('../middleware/authenticateApiKey');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.post(
  '/upload',
  authenticate,
  authorize('UNIVERSITY'),
  credentialController.upload.single('file'),
  credentialController.uploadBatch
);

router.post(
  '/issue/:batchId',
  authenticate,
  authorize('UNIVERSITY'),
  credentialController.issueBatch
);

router.post('/api/issue', authenticateApiKey, credentialController.issueFromApi);

router.get(
  '/mine/verification-history',
  authenticate,
  authorize('STUDENT'),
  credentialController.getMyVerificationHistory
);

router.get(
  '/mine',
  authenticate,
  authorize('STUDENT'),
  credentialController.getMyCredentials
);

router.get(
  '/institution',
  authenticate,
  authorize('UNIVERSITY'),
  credentialController.getInstitutionCredentials
);

router.get('/:id/pdf', authenticate, credentialController.downloadCredentialPdf);

router.get('/:id', authenticate, credentialController.getCredentialById);

router.post(
  '/:id/revoke',
  authenticate,
  authorize('UNIVERSITY'),
  credentialController.revokeCredential
);

module.exports = router;
