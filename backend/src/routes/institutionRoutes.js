const express = require('express');
const institutionController = require('../controllers/institutionController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.get('/trust-registry', institutionController.getTrustRegistry);

router.get('/', authenticate, authorize('ADMIN'), institutionController.getAllInstitutions);
router.post('/', authenticate, authorize('ADMIN'), institutionController.registerInstitution);
router.get('/:id', authenticate, institutionController.getInstitutionById);
router.patch('/:id/approve', authenticate, authorize('ADMIN'), institutionController.approveInstitution);
router.patch('/:id/suspend', authenticate, authorize('ADMIN'), institutionController.suspendInstitution);
router.post('/:institutionId/registrars', authenticate, authorize('ADMIN'), institutionController.createRegistrar);

module.exports = router;
