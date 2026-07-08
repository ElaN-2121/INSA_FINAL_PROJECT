const express = require('express');
const adminController = require('../controllers/adminController');
const apiKeyController = require('../controllers/apiKeyController');
const institutionController = require('../controllers/institutionController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/audit-logs', adminController.getAuditLogs);
router.get('/users', adminController.getAllUsers);
router.get('/stats', adminController.getSystemStats);
router.post('/create-admin', adminController.createAdmin);
router.get('/institutions/pending', adminController.getPendingInstitutions);
router.get('/institutions', adminController.getAllInstitutionsAdmin);
router.post('/institutions', institutionController.registerInstitution);
router.patch('/institutions/:id/approve', institutionController.approveInstitution);
router.patch('/institutions/:id/suspend', institutionController.suspendInstitution);

router.post('/institutions/:institutionId/api-keys', apiKeyController.generateKey);
router.get('/institutions/:institutionId/api-keys', apiKeyController.listKeys);
router.delete('/institutions/:institutionId/api-keys/:keyId', apiKeyController.revokeKey);

module.exports = router;
