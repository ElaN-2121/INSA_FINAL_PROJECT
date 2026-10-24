const { query } = require('../config/database');

/**
 * University Analytics: Department Breakdown
 */
async function getUniversityDepartments(institutionId, { from, to, sort } = {}) {
  const params = [institutionId];
  let fromClause = '';
  let toClause = '';

  if (from) {
    params.push(from);
    fromClause = `AND c.created_at >= $${params.length}::timestamp`;
  }
  if (to) {
    params.push(to);
    toClause = `AND c.created_at <= $${params.length}::timestamp`;
  }

  const sql = `
    WITH dept_creds AS (
      SELECT
        c.id,
        c.institution_id,
        COALESCE(NULLIF(TRIM(c.major), ''), c.degree_name, 'General Studies') AS department,
        c.status,
        c.created_at
      FROM credentials c
      WHERE c.institution_id = $1
        ${fromClause}
        ${toClause}
    ),
    dept_verifications AS (
      SELECT
        dc.department,
        COUNT(vl.id) AS times_verified,
        COUNT(CASE WHEN vl.result = 'VALID' THEN 1 END) AS successful_verifications,
        MAX(vl.checked_at) AS last_verified
      FROM dept_creds dc
      JOIN verification_logs vl ON vl.credential_id = dc.id
      GROUP BY dc.department
    ),
    dept_requests AS (
      SELECT
        dc.department,
        COUNT(vr.id) AS consent_requests_received,
        COUNT(CASE WHEN vr.status IN ('APPROVED', 'COMPLETED') THEN 1 END) AS approved_requests
      FROM dept_creds dc
      JOIN verification_requests vr ON vr.credential_id = dc.id
      GROUP BY dc.department
    )
    SELECT
      dc.department,
      COUNT(dc.id)::int AS credentials_issued,
      COUNT(CASE WHEN dc.status = 'ACTIVE' THEN 1 END)::int AS active_credentials,
      COUNT(CASE WHEN dc.status = 'REVOKED' THEN 1 END)::int AS revoked_credentials,
      COALESCE(dv.times_verified, 0)::int AS times_verified,
      COALESCE(dv.successful_verifications, 0)::int AS successful_verifications,
      COALESCE(dr.consent_requests_received, 0)::int AS consent_requests_received,
      COALESCE(dr.approved_requests, 0)::int AS approved_requests,
      dv.last_verified
    FROM dept_creds dc
    LEFT JOIN dept_verifications dv ON dv.department = dc.department
    LEFT JOIN dept_requests dr ON dr.department = dc.department
    GROUP BY
      dc.department,
      dv.times_verified,
      dv.successful_verifications,
      dr.consent_requests_received,
      dr.approved_requests,
      dv.last_verified
    ORDER BY dc.department ASC;
  `;

  const { rows } = await query(sql, params);
  return rows;
}

/**
 * University Analytics: 6-Month Verification Trend
 */
async function getUniversityTrend(institutionId, { department } = {}) {
  const params = [institutionId];
  let deptClause = '';

  if (department) {
    params.push(department);
    deptClause = `AND COALESCE(NULLIF(TRIM(c.major), ''), c.degree_name) = $${params.length}`;
  }

  const sql = `
    SELECT
      TO_CHAR(DATE_TRUNC('month', vl.checked_at), 'YYYY-MM') AS period,
      TO_CHAR(DATE_TRUNC('month', vl.checked_at), 'Mon YYYY') AS period_label,
      COUNT(vl.id)::int AS total_verifications,
      COUNT(CASE WHEN vl.result = 'VALID' THEN 1 END)::int AS successful_verifications,
      COUNT(CASE WHEN vl.result != 'VALID' THEN 1 END)::int AS failed_verifications
    FROM verification_logs vl
    JOIN credentials c ON c.id = vl.credential_id
    WHERE c.institution_id = $1
      AND vl.checked_at >= NOW() - INTERVAL '6 months'
      ${deptClause}
    GROUP BY DATE_TRUNC('month', vl.checked_at)
    ORDER BY DATE_TRUNC('month', vl.checked_at) ASC;
  `;

  const { rows } = await query(sql, params);
  return rows;
}

/**
 * Employer Analytics: Candidate Pipeline Totals & Breakdowns
 */
async function getEmployerCandidates(employerId) {
  // 1. Overall Pipeline Totals & Avg Time to Approval
  const totalsSql = `
    SELECT
      COUNT(vr.id)::int AS requests_sent,
      COUNT(CASE WHEN vr.status IN ('APPROVED', 'COMPLETED') THEN 1 END)::int AS approved,
      COUNT(CASE WHEN vr.status = 'DENIED' THEN 1 END)::int AS denied,
      COUNT(CASE WHEN vr.status = 'PENDING' THEN 1 END)::int AS pending,
      ROUND(AVG(
        CASE
          WHEN vr.status IN ('APPROVED', 'COMPLETED') AND vr.responded_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (vr.responded_at - vr.requested_at))
        END
      ))::int AS avg_approval_seconds
    FROM verification_requests vr
    WHERE vr.employer_id = $1;
  `;
  const { rows: totalsRows } = await query(totalsSql, [employerId]);
  const totals = totalsRows[0] || {
    requests_sent: 0,
    approved: 0,
    denied: 0,
    pending: 0,
    avg_approval_seconds: null,
  };

  // 2. University Breakdown (ranked by approved candidates)
  const universitiesSql = `
    SELECT
      i.id AS institution_id,
      i.name AS institution_name,
      COUNT(vr.id)::int AS total_requests,
      COUNT(CASE WHEN vr.status IN ('APPROVED', 'COMPLETED') THEN 1 END)::int AS approved_candidates,
      COUNT(CASE WHEN vr.status = 'PENDING' THEN 1 END)::int AS pending_requests,
      COUNT(CASE WHEN vr.status = 'DENIED' THEN 1 END)::int AS denied_requests
    FROM verification_requests vr
    JOIN credentials c ON c.id = vr.credential_id
    JOIN institutions i ON i.id = c.institution_id
    WHERE vr.employer_id = $1
    GROUP BY i.id, i.name
    ORDER BY approved_candidates DESC, total_requests DESC;
  `;
  const { rows: universities } = await query(universitiesSql, [employerId]);

  // 3. Department Breakdown (ranked by approved candidates)
  const departmentsSql = `
    SELECT
      COALESCE(NULLIF(TRIM(c.major), ''), c.degree_name, 'General Studies') AS department,
      COUNT(vr.id)::int AS total_requests,
      COUNT(CASE WHEN vr.status IN ('APPROVED', 'COMPLETED') THEN 1 END)::int AS approved_candidates,
      COUNT(CASE WHEN vr.status = 'PENDING' THEN 1 END)::int AS pending_requests,
      COUNT(CASE WHEN vr.status = 'DENIED' THEN 1 END)::int AS denied_requests
    FROM verification_requests vr
    JOIN credentials c ON c.id = vr.credential_id
    WHERE vr.employer_id = $1
    GROUP BY COALESCE(NULLIF(TRIM(c.major), ''), c.degree_name, 'General Studies')
    ORDER BY approved_candidates DESC, total_requests DESC;
  `;
  const { rows: departments } = await query(departmentsSql, [employerId]);

  // 4. Monthly Trend (last 6 months)
  const monthlySql = `
    SELECT
      TO_CHAR(DATE_TRUNC('month', vr.requested_at), 'YYYY-MM') AS period,
      TO_CHAR(DATE_TRUNC('month', vr.requested_at), 'Mon YYYY') AS period_label,
      COUNT(vr.id)::int AS requests_sent,
      COUNT(CASE WHEN vr.status IN ('APPROVED', 'COMPLETED') THEN 1 END)::int AS approved,
      COUNT(CASE WHEN vr.status = 'DENIED' THEN 1 END)::int AS denied,
      COUNT(CASE WHEN vr.status = 'PENDING' THEN 1 END)::int AS pending
    FROM verification_requests vr
    WHERE vr.employer_id = $1
      AND vr.requested_at >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', vr.requested_at)
    ORDER BY DATE_TRUNC('month', vr.requested_at) ASC;
  `;
  const { rows: monthlyTrend } = await query(monthlySql, [employerId]);

  // 5. Detailed Candidate Pipeline List
  const candidatesSql = `
    SELECT
      vr.id AS request_id,
      vr.credential_id,
      u.full_name AS candidate_name,
      u.email AS candidate_email,
      u.fayda_id AS candidate_fayda_id,
      i.name AS institution_name,
      c.degree_name,
      COALESCE(NULLIF(TRIM(c.major), ''), 'General Studies') AS department,
      c.serial_number,
      vr.status,
      vr.requested_at,
      vr.responded_at
    FROM verification_requests vr
    JOIN credentials c ON c.id = vr.credential_id
    JOIN users u ON u.id = vr.student_id
    JOIN institutions i ON i.id = c.institution_id
    WHERE vr.employer_id = $1
    ORDER BY vr.requested_at DESC;
  `;
  const { rows: candidates } = await query(candidatesSql, [employerId]);

  return {
    totals,
    universities,
    departments,
    monthly_trend: monthlyTrend,
    candidates,
  };
}

/**
 * Student Analytics: Requests, Verifications & Chronological Access Log
 */
async function getStudentActivity(studentId) {
  // 1. Consent Requests Totals
  const requestsSql = `
    SELECT
      COUNT(vr.id)::int AS requests_received,
      COUNT(CASE WHEN vr.status IN ('APPROVED', 'COMPLETED') THEN 1 END)::int AS approved,
      COUNT(CASE WHEN vr.status = 'DENIED' THEN 1 END)::int AS denied,
      COUNT(CASE WHEN vr.status = 'PENDING' THEN 1 END)::int AS pending
    FROM verification_requests vr
    WHERE vr.student_id = $1;
  `;
  const { rows: reqRows } = await query(requestsSql, [studentId]);
  const requests = reqRows[0] || {
    requests_received: 0,
    approved: 0,
    denied: 0,
    pending: 0,
  };

  // 2. Verifications Run on Student Credentials
  const verificationsSql = `
    SELECT
      COUNT(vl.id)::int AS total_verifications,
      COUNT(CASE WHEN vl.result = 'VALID' THEN 1 END)::int AS valid_verifications,
      COUNT(CASE WHEN vl.result != 'VALID' THEN 1 END)::int AS invalid_verifications,
      MAX(vl.checked_at) AS last_verified
    FROM credentials c
    JOIN verification_logs vl ON vl.credential_id = c.id
    WHERE c.holder_id = $1;
  `;
  const { rows: verifRows } = await query(verificationsSql, [studentId]);
  const verifications = verifRows[0] || {
    total_verifications: 0,
    valid_verifications: 0,
    invalid_verifications: 0,
    last_verified: null,
  };

  // 3. Chronological Access & Verification Log (Consent requests + Cryptographic verifications)
  const logSql = `
    SELECT
      vr.id,
      'CONSENT_REQUEST' AS event_type,
      eu.full_name AS employer_name,
      COALESCE(eu.company_name, eu.full_name) AS employer_company,
      c.id AS credential_id,
      c.degree_name,
      c.serial_number,
      vr.status AS status,
      vr.requested_at AS timestamp,
      vr.responded_at
    FROM verification_requests vr
    JOIN users eu ON eu.id = vr.employer_id
    JOIN credentials c ON c.id = vr.credential_id
    WHERE vr.student_id = $1

    UNION ALL

    SELECT
      vl.id,
      'VERIFICATION_CHECK' AS event_type,
      COALESCE(eu.full_name, 'Verification Authority') AS employer_name,
      COALESCE(eu.company_name, 'Direct Verification Portal') AS employer_company,
      c.id AS credential_id,
      c.degree_name,
      c.serial_number,
      vl.result AS status,
      vl.checked_at AS timestamp,
      vl.checked_at AS responded_at
    FROM verification_logs vl
    JOIN credentials c ON c.id = vl.credential_id
    LEFT JOIN verification_requests vr ON vr.id = vl.request_id
    LEFT JOIN users eu ON eu.id = vr.employer_id
    WHERE c.holder_id = $1

    ORDER BY timestamp DESC
    LIMIT 60;
  `;
  const { rows: accessLog } = await query(logSql, [studentId]);

  // 4. Credential Health Summary (per credential)
  const credsSql = `
    SELECT
      c.id,
      c.degree_name,
      c.major,
      c.serial_number,
      c.status,
      c.issue_date,
      i.name AS institution_name,
      COUNT(vl.id)::int AS times_verified,
      MAX(vl.checked_at) AS last_verified
    FROM credentials c
    JOIN institutions i ON i.id = c.institution_id
    LEFT JOIN verification_logs vl ON vl.credential_id = c.id
    WHERE c.holder_id = $1
    GROUP BY c.id, c.degree_name, c.major, c.serial_number, c.status, c.issue_date, i.name
    ORDER BY c.issue_date DESC;
  `;
  const { rows: credentialHealth } = await query(credsSql, [studentId]);

  return {
    requests,
    verifications,
    access_log: accessLog,
    credential_health: credentialHealth,
  };
}

module.exports = {
  getUniversityDepartments,
  getUniversityTrend,
  getEmployerCandidates,
  getStudentActivity,
};
