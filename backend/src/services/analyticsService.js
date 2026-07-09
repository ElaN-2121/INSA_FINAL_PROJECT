const analyticsRepository = require('../repositories/analyticsRepository');

async function getSystemOverview() {
  return analyticsRepository.getSystemOverview();
}

async function getInstitutionLeaderboard() {
  return analyticsRepository.getInstitutionLeaderboard();
}

async function getDepartmentBreakdown(institutionId = null) {
  return analyticsRepository.getDepartmentBreakdown(institutionId);
}

async function getVerificationTrends(months = 6) {
  return analyticsRepository.getVerificationTrends(months);
}

async function getInstitutionStats(institutionId) {
  return analyticsRepository.getInstitutionStats(institutionId);
}

async function getEmployerActivityStats() {
  return analyticsRepository.getEmployerActivityStats();
}

module.exports = {
  getSystemOverview,
  getInstitutionLeaderboard,
  getDepartmentBreakdown,
  getVerificationTrends,
  getInstitutionStats,
  getEmployerActivityStats,
};
