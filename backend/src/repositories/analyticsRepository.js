const { query } = require('../config/database');

async function getSystemOverview() {
  const result = await query(`
    SELECT
      (SELECT COUNT(*)::int FROM institutions) AS total_institutions,
      (SELECT COUNT(*)::int FROM institutions WHERE status = 'ACTIVE') AS active_institutions,
      (SELECT COUNT(*)::int FROM credentials) AS total_credentials,
      (SELECT COUNT(*)::int FROM verification_logs) AS total_verifications,
      (SELECT COUNT(*)::int FROM users WHERE role = 'STUDENT') AS total_students,
      (SELECT COUNT(*)::int FROM users WHERE role = 'EMPLOYER') AS total_employers
  `);

  const row = result.rows[0];
  return {
    totalInstitutions: row.total_institutions,
    activeInstitutions: row.active_institutions,
    totalCredentials: row.total_credentials,
    totalVerifications: row.total_verifications,
    totalStudents: row.total_students,
    totalEmployers: row.total_employers,
  };
}

async function getInstitutionLeaderboard() {
  const result = await query(`
    SELECT i.id, i.name,
      COUNT(DISTINCT c.id) AS credentials_issued,
      COUNT(DISTINCT vl.id) AS verifications_completed,
      COUNT(DISTINCT c.holder_id) AS unique_graduates_verified
    FROM institutions i
    LEFT JOIN credentials c ON c.institution_id = i.id AND c.status = 'ACTIVE'
    LEFT JOIN verification_logs vl ON vl.credential_id = c.id AND vl.result = 'VALID'
    WHERE i.status = 'ACTIVE'
    GROUP BY i.id, i.name
    ORDER BY verifications_completed DESC
  `);
  return result.rows;
}

async function getDepartmentBreakdown(institutionId = null) {
  const result = await query(
    `SELECT
      COALESCE(c.major, 'Unspecified') AS department,
      COUNT(DISTINCT c.id) AS credentials_issued,
      COUNT(DISTINCT vl.id) AS verifications_completed,
      ROUND(AVG(c.gpa::numeric), 2) AS average_gpa
    FROM credentials c
    LEFT JOIN verification_logs vl ON vl.credential_id = c.id AND vl.result = 'VALID'
    WHERE ($1::uuid IS NULL OR c.institution_id = $1)
      AND c.status = 'ACTIVE'
    GROUP BY c.major
    ORDER BY verifications_completed DESC`,
    [institutionId]
  );
  return result.rows;
}

async function getVerificationTrends(months = 6) {
  const safeMonths = Math.min(Math.max(parseInt(months, 10) || 6, 1), 24);
  const result = await query(
    `SELECT DATE_TRUNC('month', checked_at) AS month,
      COUNT(*) AS total_verifications,
      COUNT(*) FILTER (WHERE result = 'VALID') AS successful,
      COUNT(*) FILTER (WHERE result != 'VALID') AS failed
    FROM verification_logs
    WHERE checked_at >= NOW() - INTERVAL '1 month' * $1
    GROUP BY month ORDER BY month ASC`,
    [safeMonths]
  );
  return result.rows;
}

async function getInstitutionStats(institutionId) {
  const [summaryResult, departmentResult, yearResult] = await Promise.all([
    query(
      `SELECT
        COUNT(*)::int AS credentials_issued,
        COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active_count,
        COUNT(*) FILTER (WHERE status = 'REVOKED')::int AS revoked_count,
        COUNT(DISTINCT holder_id)::int AS unique_graduates
      FROM credentials
      WHERE institution_id = $1`,
      [institutionId]
    ),
    query(
      `SELECT
        COALESCE(major, 'Unspecified') AS department,
        COUNT(*)::int AS credentials_issued,
        ROUND(AVG(gpa::numeric), 2) AS average_gpa
      FROM credentials
      WHERE institution_id = $1 AND status = 'ACTIVE'
      GROUP BY major
      ORDER BY credentials_issued DESC`,
      [institutionId]
    ),
    query(
      `SELECT
        graduation_year,
        COUNT(*)::int AS credentials_issued
      FROM credentials
      WHERE institution_id = $1 AND status = 'ACTIVE'
      GROUP BY graduation_year
      ORDER BY graduation_year DESC`,
      [institutionId]
    ),
  ]);

  const verificationsResult = await query(
    `SELECT COUNT(*)::int AS total_verifications
     FROM verification_logs vl
     INNER JOIN credentials c ON c.id = vl.credential_id
     WHERE c.institution_id = $1`,
    [institutionId]
  );

  const summary = summaryResult.rows[0];
  return {
    credentialsIssued: summary.credentials_issued,
    activeCount: summary.active_count,
    revokedCount: summary.revoked_count,
    uniqueGraduates: summary.unique_graduates,
    totalVerifications: verificationsResult.rows[0].total_verifications,
    departmentBreakdown: departmentResult.rows,
    graduationYearBreakdown: yearResult.rows,
  };
}

async function getEmployerActivityStats() {
  const result = await query(`
    SELECT u.full_name AS employer_name, u.company_name,
      COUNT(vr.id) AS total_requests,
      COUNT(vr.id) FILTER (WHERE vr.status = 'COMPLETED') AS completed_verifications
    FROM users u
    LEFT JOIN verification_requests vr ON vr.employer_id = u.id
    WHERE u.role = 'EMPLOYER'
    GROUP BY u.id, u.full_name, u.company_name
    ORDER BY completed_verifications DESC
    LIMIT 20
  `);
  return result.rows;
}

module.exports = {
  getSystemOverview,
  getInstitutionLeaderboard,
  getDepartmentBreakdown,
  getVerificationTrends,
  getInstitutionStats,
  getEmployerActivityStats,
};
