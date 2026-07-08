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
const API_KEY_GENERATED = 'API_KEY_GENERATED';
const API_KEY_REVOKED = 'API_KEY_REVOKED';

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

async function getFilteredLogs({
  action = null,
  userId = null,
  entityType = null,
  startDate = null,
  endDate = null,
  limit = 50,
  offset = 0,
} = {}) {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (action) {
    conditions.push(`al.action = $${paramIndex++}`);
    params.push(action);
  }
  if (userId) {
    conditions.push(`al.user_id = $${paramIndex++}`);
    params.push(userId);
  }
  if (entityType) {
    conditions.push(`al.entity_type = $${paramIndex++}`);
    params.push(entityType);
  }
  if (startDate) {
    conditions.push(`al.created_at >= $${paramIndex++}`);
    params.push(startDate);
  }
  if (endDate) {
    conditions.push(`al.created_at <= $${paramIndex++}::date + INTERVAL '1 day' - INTERVAL '1 second'`);
    params.push(endDate);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM audit_logs al ${whereClause}`,
    params
  );

  const logsResult = await query(
    `SELECT al.*, u.full_name, u.role AS user_role
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.user_id
     ${whereClause}
     ORDER BY al.created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset]
  );

  return {
    rows: logsResult.rows,
    total: countResult.rows[0].total,
  };
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
  API_KEY_GENERATED,
  API_KEY_REVOKED,
  log,
  getRecentLogs,
  getFilteredLogs,
};
