const analyticsRepository = require('../repositories/analyticsRepository');

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '—';
  if (seconds < 3600) {
    const mins = Math.round(seconds / 60);
    return `${mins} min${mins !== 1 ? 's' : ''}`;
  }
  if (seconds < 86400) {
    const hours = (seconds / 3600).toFixed(1);
    return `${hours.replace(/\.0$/, '')} hour${hours !== '1' ? 's' : ''}`;
  }
  const days = (seconds / 86400).toFixed(1);
  return `${days.replace(/\.0$/, '')} day${days !== '1' ? 's' : ''}`;
}

const maskSmall = (num) => (typeof num === 'number' && num > 0 && num < 3 ? '<3' : num);

/**
 * University Departments Analytics with Differential Privacy Threshold (<3 events masked)
 */
async function getUniversityDepartments(institutionId, { from, to, sort } = {}) {
  const rows = await analyticsRepository.getUniversityDepartments(institutionId, { from, to, sort });

  const formatted = rows.map((row) => {
    const successRate =
      row.times_verified > 0
        ? Math.round((row.successful_verifications / row.times_verified) * 1000) / 10
        : null;

    const approvalRate =
      row.consent_requests_received > 0
        ? Math.round((row.approved_requests / row.consent_requests_received) * 1000) / 10
        : null;

    const isLowVolume = row.times_verified > 0 && row.times_verified < 3;

    return {
      department: row.department,
      credentials_issued: row.credentials_issued,
      credentials_issued_display: row.credentials_issued < 3 ? '<3' : row.credentials_issued,
      active_credentials: row.active_credentials,
      revoked_credentials: row.revoked_credentials,
      times_verified: row.times_verified,
      times_verified_display: maskSmall(row.times_verified),
      successful_verifications: row.successful_verifications,
      verification_success_rate: successRate,
      consent_requests_received: row.consent_requests_received,
      consent_requests_display: maskSmall(row.consent_requests_received),
      approved_requests: row.approved_requests,
      approval_rate: approvalRate,
      last_verified: row.last_verified,
      is_masked: isLowVolume || row.credentials_issued < 3,
    };
  });

  // Apply sorting
  if (sort === 'issued') {
    formatted.sort((a, b) => b.credentials_issued - a.credentials_issued);
  } else if (sort === 'approval_rate') {
    formatted.sort((a, b) => (b.approval_rate ?? -1) - (a.approval_rate ?? -1));
  } else if (sort === 'success_rate') {
    formatted.sort((a, b) => (b.verification_success_rate ?? -1) - (a.verification_success_rate ?? -1));
  } else if (sort === 'name') {
    formatted.sort((a, b) => a.department.localeCompare(b.department));
  } else {
    // Default: times_verified descending
    formatted.sort((a, b) => b.times_verified - a.times_verified || b.credentials_issued - a.credentials_issued);
  }

  // Derive Highlight Cards
  const withVerifs = formatted.filter((d) => d.times_verified > 0);
  const mostVerified = withVerifs.length > 0 ? withVerifs[0] : null;

  const withApprovals = formatted.filter((d) => d.approval_rate !== null);
  withApprovals.sort((a, b) => (b.approval_rate ?? 0) - (a.approval_rate ?? 0));
  const highestApproval = withApprovals.length > 0 ? withApprovals[0] : null;

  // "Needs attention": highest revocation, or low approval (<50%), or verification failures
  const needsAttentionList = formatted.filter(
    (d) =>
      d.revoked_credentials > 0 ||
      (d.approval_rate !== null && d.approval_rate < 50) ||
      (d.verification_success_rate !== null && d.verification_success_rate < 80)
  );
  const needsAttention = needsAttentionList.length > 0 ? needsAttentionList[0] : null;

  return {
    departments: formatted,
    highlights: {
      most_verified: mostVerified
        ? {
            department: mostVerified.department,
            times_verified: mostVerified.times_verified_display,
            success_rate: mostVerified.verification_success_rate,
          }
        : null,
      highest_approval: highestApproval
        ? {
            department: highestApproval.department,
            approval_rate: highestApproval.approval_rate,
            requests: highestApproval.consent_requests_display,
          }
        : null,
      needs_attention: needsAttention
        ? {
            department: needsAttention.department,
            revoked: needsAttention.revoked_credentials,
            approval_rate: needsAttention.approval_rate,
            success_rate: needsAttention.verification_success_rate,
            issue:
              needsAttention.revoked_credentials > 0
                ? `${needsAttention.revoked_credentials} credential(s) revoked`
                : needsAttention.approval_rate < 50
                ? `Low consent approval rate (${needsAttention.approval_rate}%)`
                : `Verification failure rate detected`,
          }
        : null,
    },
  };
}

/**
 * University Verification Trend (Last 6 Months)
 */
async function getUniversityTrend(institutionId, { department } = {}) {
  const trendRows = await analyticsRepository.getUniversityTrend(institutionId, { department });

  // Generate continuous last 6 calendar months
  const now = new Date();
  const periods = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const period = d.toISOString().slice(0, 7); // YYYY-MM
    const periodLabel = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    periods.push({ period, period_label: periodLabel });
  }

  const trendMap = new Map(trendRows.map((r) => [r.period, r]));

  const continuousTrend = periods.map(({ period, period_label }) => {
    const item = trendMap.get(period);
    const total = item ? item.total_verifications : 0;
    const successful = item ? item.successful_verifications : 0;
    const failed = item ? item.failed_verifications : 0;
    return {
      period,
      period_label,
      total_verifications: total,
      successful_verifications: successful,
      failed_verifications: failed,
      success_rate: total > 0 ? Math.round((successful / total) * 1000) / 10 : 100,
    };
  });

  const total6m = continuousTrend.reduce((sum, p) => sum + p.total_verifications, 0);
  const successful6m = continuousTrend.reduce((sum, p) => sum + p.successful_verifications, 0);

  return {
    trend: continuousTrend,
    department: department || 'All Departments',
    summary_6m: {
      total_verifications: total6m,
      successful_verifications: successful6m,
      success_rate: total6m > 0 ? Math.round((successful6m / total6m) * 1000) / 10 : 100,
    },
  };
}

/**
 * Employer Talent Pipeline Analytics
 */
async function getEmployerCandidates(employerId) {
  const data = await analyticsRepository.getEmployerCandidates(employerId);
  const { totals, universities, departments, monthly_trend } = data;

  const totalRequests = totals.requests_sent;
  const approved = totals.approved;
  const approvalRate =
    totalRequests > 0 ? Math.round((approved / totalRequests) * 1000) / 10 : 0;

  // Enhance universities with share percentage
  const enrichedUniversities = universities.map((u) => ({
    ...u,
    share_percentage:
      approved > 0 ? Math.round((u.approved_candidates / approved) * 1000) / 10 : 0,
  }));

  // Enhance departments with share percentage & approval rate
  const enrichedDepartments = departments.map((d) => ({
    ...d,
    approval_rate:
      d.total_requests > 0
        ? Math.round((d.approved_candidates / d.total_requests) * 1000) / 10
        : 0,
    share_percentage:
      approved > 0 ? Math.round((d.approved_candidates / approved) * 1000) / 10 : 0,
  }));

  // Ensure continuous last 6 months for employer monthly trend
  const now = new Date();
  const periods = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const period = d.toISOString().slice(0, 7);
    const periodLabel = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    periods.push({ period, period_label: periodLabel });
  }

  const monthMap = new Map(monthly_trend.map((m) => [m.period, m]));
  const continuousMonthly = periods.map(({ period, period_label }) => {
    const item = monthMap.get(period);
    return {
      period,
      period_label,
      requests_sent: item ? item.requests_sent : 0,
      approved: item ? item.approved : 0,
      denied: item ? item.denied : 0,
      pending: item ? item.pending : 0,
    };
  });

  return {
    pipeline_totals: {
      requests_sent: totals.requests_sent,
      approved_candidates: totals.approved,
      denied_requests: totals.denied,
      pending_requests: totals.pending,
      approval_rate: approvalRate,
      avg_time_to_approval_seconds: totals.avg_approval_seconds,
      avg_time_to_approval_display: formatDuration(totals.avg_approval_seconds),
    },
    universities: enrichedUniversities,
    departments: enrichedDepartments,
    monthly_trend: continuousMonthly,
    candidates: data.candidates || [],
    note: 'Candidates are counted when a student approves sharing their credential with you.',
  };
}

/**
 * Student Sovereign Activity & Access Log
 */
async function getStudentActivity(studentId) {
  const data = await analyticsRepository.getStudentActivity(studentId);
  const { requests, verifications, access_log, credential_health } = data;

  const totalReqs = requests.requests_received;
  const approvedReqs = requests.approved;
  const approvalRate =
    totalReqs > 0 ? Math.round((approvedReqs / totalReqs) * 1000) / 10 : 0;

  // Process access log with human-readable descriptions
  const formattedLog = access_log.map((item) => {
    let actionDescription = 'Consent Request Received';
    if (item.event_type === 'VERIFICATION_CHECK') {
      if (item.status === 'VALID') {
        actionDescription = 'Cryptographic Verification Verified';
      } else if (item.status === 'REVOKED') {
        actionDescription = 'Credential Revocation Flagged';
      } else {
        actionDescription = `Verification Check (${item.status})`;
      }
    } else {
      if (item.status === 'APPROVED') {
        actionDescription = 'Access Granted to Employer';
      } else if (item.status === 'DENIED') {
        actionDescription = 'Access Declined by Student';
      } else if (item.status === 'COMPLETED') {
        actionDescription = 'Verification Dossier Inspected';
      }
    }

    return {
      id: item.id,
      event_type: item.event_type,
      employer_name: item.employer_name,
      employer_company: item.employer_company || item.employer_name,
      credential_id: item.credential_id,
      degree_name: item.degree_name,
      serial_number: item.serial_number,
      status: item.status,
      action_description: actionDescription,
      requested_at: item.timestamp,
      responded_at: item.responded_at,
    };
  });

  // Credential health checks
  const enrichedCredentials = credential_health.map((cred) => ({
    id: cred.id,
    degree_name: cred.degree_name,
    major: cred.major,
    serial_number: cred.serial_number,
    status: cred.status,
    institution_name: cred.institution_name,
    issue_date: cred.issue_date,
    times_verified: cred.times_verified,
    last_verified: cred.last_verified,
    is_active: cred.status === 'ACTIVE',
    share_ready: cred.status === 'ACTIVE',
  }));

  return {
    requests_summary: {
      received: requests.requests_received,
      approved: requests.approved,
      denied: requests.denied,
      pending: requests.pending,
      approval_rate: approvalRate,
    },
    verifications_summary: {
      total_verifications: verifications.total_verifications,
      valid_verifications: verifications.valid_verifications,
      invalid_verifications: verifications.invalid_verifications,
      last_verified: verifications.last_verified,
    },
    access_log: formattedLog,
    credential_health: enrichedCredentials,
  };
}

module.exports = {
  getUniversityDepartments,
  getUniversityTrend,
  getEmployerCandidates,
  getStudentActivity,
};
