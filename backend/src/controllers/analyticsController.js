const analyticsService = require('../services/analyticsService');
const { success, error } = require('../utils/apiResponse');

function isValidDate(dateStr) {
  if (!dateStr) return true;
  const timestamp = Date.parse(dateStr);
  return !isNaN(timestamp);
}

/**
 * GET /api/analytics/university/departments
 */
async function getUniversityDepartments(req, res, next) {
  try {
    const institutionId = req.user.institution_id;
    if (!institutionId) {
      return error(res, 'No institution linked to this registrar account', 400);
    }

    const { from, to, sort } = req.query;

    if (from && !isValidDate(from)) {
      return error(res, 'Invalid "from" date parameter. Expected ISO format (YYYY-MM-DD)', 400);
    }
    if (to && !isValidDate(to)) {
      return error(res, 'Invalid "to" date parameter. Expected ISO format (YYYY-MM-DD)', 400);
    }
    if (from && to && new Date(from) > new Date(to)) {
      return error(res, '"from" date cannot be after "to" date', 400);
    }

    const data = await analyticsService.getUniversityDepartments(institutionId, { from, to, sort });
    return success(res, data, 'Department analytics retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/analytics/university/trend
 */
async function getUniversityTrend(req, res, next) {
  try {
    const institutionId = req.user.institution_id;
    if (!institutionId) {
      return error(res, 'No institution linked to this registrar account', 400);
    }

    const { department } = req.query;
    const data = await analyticsService.getUniversityTrend(institutionId, { department });
    return success(res, data, 'University verification trend retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/analytics/employer/candidates
 */
async function getEmployerCandidates(req, res, next) {
  try {
    const employerId = req.user.id;
    if (!employerId) {
      return error(res, 'Unauthorized employer account', 401);
    }

    const data = await analyticsService.getEmployerCandidates(employerId);
    return success(res, data, 'Candidate pipeline analytics retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/analytics/student/activity
 */
async function getStudentActivity(req, res, next) {
  try {
    const studentId = req.user.id;
    if (!studentId) {
      return error(res, 'Unauthorized student account', 401);
    }

    const data = await analyticsService.getStudentActivity(studentId);
    return success(res, data, 'Student activity analytics retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getUniversityDepartments,
  getUniversityTrend,
  getEmployerCandidates,
  getStudentActivity,
};
