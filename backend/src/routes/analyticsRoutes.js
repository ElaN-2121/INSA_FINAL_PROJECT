const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const analyticsController = require('../controllers/analyticsController');

/**
 * University Analytics (Role: UNIVERSITY)
 */
router.get(
  '/university/departments',
  authenticate,
  authorize('UNIVERSITY'),
  analyticsController.getUniversityDepartments
);

router.get(
  '/university/trend',
  authenticate,
  authorize('UNIVERSITY'),
  analyticsController.getUniversityTrend
);

/**
 * Employer Analytics (Role: EMPLOYER)
 */
router.get(
  '/employer/candidates',
  authenticate,
  authorize('EMPLOYER'),
  analyticsController.getEmployerCandidates
);

/**
 * Student Analytics (Role: STUDENT)
 */
router.get(
  '/student/activity',
  authenticate,
  authorize('STUDENT'),
  analyticsController.getStudentActivity
);

module.exports = router;
