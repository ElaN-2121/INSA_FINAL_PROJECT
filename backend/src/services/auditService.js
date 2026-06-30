const { query } = require('../config/database');

const USER_LOGIN = 'USER_LOGIN';
const USER_LOGOUT = 'USER_LOGOUT';
const CREDENTIAL_ISSUED = 'CREDENTIAL_ISSUED';
const CREDENTIAL_REVOKED = 'CREDENTIAL_REVOKED';
const VERIFICATION_REQUESTED = 'VERIFICATION_REQUESTED';
const VERIFICATION_APPROVED = 'VERIFICATION_APPROVED';
const VERIFICATION_DENIED = 'VERIFICATION_DENIED';
const VERIFICATION_COMPLETED = 'VERIFICATION_COMPLETED';
const INSTITUTION_REGISTERED = 'INSTITUTION_REGISTERED';
const INSTITUTION_APPROVED = 'INSTITUTION_APPROVED';
const REGISTRAR_CREATED = 'REGISTRAR_CREATED';
const ADMIN_CREATED = 'ADMIN_CREATED';

async function log({ userId, action, entityType, entityId, ipAddress, details }, client = null) {
  const db = client || { query };
  const result = await db.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, details)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, action, entityType, entityId, ipAddress, details || null]
  );
  return result.rows[0];
}

async function getRecentLogs(limit = 50) {
  const result = await query(
    `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}

module.exports = {
  USER_LOGIN,
  USER_LOGOUT,
  CREDENTIAL_ISSUED,
  CREDENTIAL_REVOKED,
  VERIFICATION_REQUESTED,
  VERIFICATION_APPROVED,
  VERIFICATION_DENIED,
  VERIFICATION_COMPLETED,
  INSTITUTION_REGISTERED,
  INSTITUTION_APPROVED,
  REGISTRAR_CREATED,
  ADMIN_CREATED,
  log,
  getRecentLogs,
};
