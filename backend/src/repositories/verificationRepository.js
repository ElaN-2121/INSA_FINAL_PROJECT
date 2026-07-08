const { query } = require('../config/database');

async function createRequest({ credentialId, employerId, studentId, expiresAt }) {
  const result = await query(
    `INSERT INTO verification_requests (credential_id, employer_id, student_id, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [credentialId, employerId, studentId, expiresAt]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await query(
    `SELECT
       vr.*,
       c.serial_number,
       c.degree_name,
       c.major,
       c.graduation_year,
       c.gpa,
       c.issue_date,
       c.status AS credential_status,
       eu.full_name AS employer_name,
       eu.email AS employer_email,
       su.full_name AS student_name,
       su.email AS student_email
     FROM verification_requests vr
     INNER JOIN credentials c ON c.id = vr.credential_id
     INNER JOIN users eu ON eu.id = vr.employer_id
     INNER JOIN users su ON su.id = vr.student_id
     WHERE vr.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function findByEmployerId(employerId) {
  const result = await query(
    `SELECT
       vr.*,
       c.serial_number,
       c.degree_name,
       c.major,
       c.graduation_year,
       c.gpa,
       c.issue_date,
       c.status AS credential_status
     FROM verification_requests vr
     INNER JOIN credentials c ON c.id = vr.credential_id
     WHERE vr.employer_id = $1
     ORDER BY vr.requested_at DESC`,
    [employerId]
  );
  return result.rows;
}

async function findByStudentId(studentId) {
  const result = await query(
    `SELECT
       vr.*,
       c.serial_number,
       c.degree_name,
       eu.full_name AS employer_name
     FROM verification_requests vr
     INNER JOIN credentials c ON c.id = vr.credential_id
     INNER JOIN users eu ON eu.id = vr.employer_id
     WHERE vr.student_id = $1
     ORDER BY vr.requested_at DESC`,
    [studentId]
  );
  return result.rows;
}

async function findPendingByStudentId(studentId) {
  const result = await query(
    `SELECT
       vr.*,
       c.serial_number,
       c.degree_name,
       eu.full_name AS employer_name
     FROM verification_requests vr
     INNER JOIN credentials c ON c.id = vr.credential_id
     INNER JOIN users eu ON eu.id = vr.employer_id
     WHERE vr.student_id = $1 AND vr.status = 'PENDING'
     ORDER BY vr.requested_at DESC`,
    [studentId]
  );
  return result.rows;
}

async function updateStatus(id, status, respondedAt = null) {
  const result = await query(
    `UPDATE verification_requests
     SET status = $2,
         responded_at = COALESCE($3, responded_at)
     WHERE id = $1
     RETURNING *`,
    [id, status, respondedAt]
  );
  return result.rows[0] || null;
}

async function createLog({ requestId, credentialId, result, details }) {
  const logResult = await query(
    `INSERT INTO verification_logs (request_id, credential_id, result, details)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [requestId, credentialId, result, details]
  );
  return logResult.rows[0];
}

async function findLogsByCredentialId(credentialId) {
  const result = await query(
    `SELECT * FROM verification_logs WHERE credential_id = $1 ORDER BY checked_at DESC`,
    [credentialId]
  );
  return result.rows;
}

async function findApprovedRequest(credentialId, employerId) {
  const result = await query(
    `SELECT * FROM verification_requests
     WHERE credential_id = $1 AND employer_id = $2 AND status = 'APPROVED'
     ORDER BY responded_at DESC LIMIT 1`,
    [credentialId, employerId]
  );
  return result.rows[0] || null;
}

async function findByCredentialIds(credentialIds) {
  if (!credentialIds || credentialIds.length === 0) {
    return [];
  }

  const result = await query(
    `SELECT vl.*, vr.employer_id, u.full_name AS employer_name, u.company_name
     FROM verification_logs vl
     LEFT JOIN verification_requests vr ON vr.id = vl.request_id
     LEFT JOIN users u ON u.id = vr.employer_id
     WHERE vl.credential_id = ANY($1::uuid[])
     ORDER BY vl.checked_at DESC`,
    [credentialIds]
  );
  return result.rows;
}

async function findApprovedCredentialsForEmployer(employerId) {
  const result = await query(
    `SELECT vr.id AS request_id, vr.credential_id, c.serial_number, c.degree_name, c.major, c.graduation_year,
            u.full_name AS holder_name, i.name AS institution_name, vr.responded_at
     FROM verification_requests vr
     INNER JOIN credentials c ON c.id = vr.credential_id
     INNER JOIN users u ON u.id = c.holder_id
     INNER JOIN institutions i ON i.id = c.institution_id
     WHERE vr.employer_id = $1 AND vr.status = 'APPROVED'
     ORDER BY vr.responded_at DESC`,
    [employerId]
  );
  return result.rows;
}

module.exports = {
  createRequest,
  findById,
  findByEmployerId,
  findByStudentId,
  findPendingByStudentId,
  updateStatus,
  createLog,
  findLogsByCredentialId,
  findApprovedRequest,
  findByCredentialIds,
  findApprovedCredentialsForEmployer,
};
