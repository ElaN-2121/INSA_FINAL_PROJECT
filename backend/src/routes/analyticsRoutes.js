const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.get('/overview', authenticate, authorize('ADMIN'), analyticsController.getSystemOverview);
router.get('/leaderboard', analyticsController.getLeaderboard);
router.get('/departments', analyticsController.getDepartmentStats);
router.get('/trends', authenticate, authorize('ADMIN'), analyticsController.getVerificationTrends);
router.get('/institution/:institutionId', authenticate, analyticsController.getInstitutionStats);
router.get('/employers', authenticate, authorize('ADMIN'), analyticsController.getEmployerActivity);

module.exports = router;
