const analyticsService = require('../services/analyticsService');
const { success } = require('../utils/apiResponse');

async function getSystemOverview(req, res) {
  const overview = await analyticsService.getSystemOverview();
  return success(res, overview, 'System overview retrieved successfully');
}

async function getLeaderboard(req, res) {
  const leaderboard = await analyticsService.getInstitutionLeaderboard();
  return success(res, leaderboard, 'Institution leaderboard retrieved successfully');
}

async function getDepartmentStats(req, res) {
  const { institutionId } = req.query;
  const stats = await analyticsService.getDepartmentBreakdown(institutionId || null);
  return success(res, stats, 'Department statistics retrieved successfully');
}

async function getVerificationTrends(req, res) {
  const months = parseInt(req.query.months, 10) || 6;
  const trends = await analyticsService.getVerificationTrends(months);
  return success(res, trends, 'Verification trends retrieved successfully');
}

async function getInstitutionStats(req, res) {
  const { institutionId } = req.params;
  const stats = await analyticsService.getInstitutionStats(institutionId);
  return success(res, stats, 'Institution statistics retrieved successfully');
}

async function getEmployerActivity(req, res) {
  const activity = await analyticsService.getEmployerActivityStats();
  return success(res, activity, 'Employer activity retrieved successfully');
}

module.exports = {
  getSystemOverview,
  getLeaderboard,
  getDepartmentStats,
  getVerificationTrends,
  getInstitutionStats,
  getEmployerActivity,
};
