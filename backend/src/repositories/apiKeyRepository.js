const { query } = require('../config/database');

async function createApiKey({ institutionId, keyHash, keyPrefix, label, createdBy, expiresAt }) {
  const result = await query(
    `INSERT INTO institution_api_keys (institution_id, key_hash, key_prefix, label, created_by, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [institutionId, keyHash, keyPrefix, label || null, createdBy || null, expiresAt || null]
  );
  return result.rows[0];
}

async function findByKeyHash(keyHash) {
  const result = await query(
    `SELECT k.*, i.id AS institution_id, i.name AS institution_name, i.status AS institution_status
     FROM institution_api_keys k
     INNER JOIN institutions i ON i.id = k.institution_id
     WHERE k.key_hash = $1`,
    [keyHash]
  );
  return result.rows[0] || null;
}

async function findByInstitutionId(institutionId) {
  const result = await query(
    `SELECT id, institution_id, key_prefix, label, last_used_at, is_active, created_at, expires_at
     FROM institution_api_keys
     WHERE institution_id = $1
     ORDER BY created_at DESC`,
    [institutionId]
  );
  return result.rows;
}

async function deactivateKey(id) {
  const result = await query(
    `UPDATE institution_api_keys SET is_active = FALSE WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
}

async function updateLastUsed(id) {
  const result = await query(
    `UPDATE institution_api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await query(
    `SELECT * FROM institution_api_keys WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  createApiKey,
  findByKeyHash,
  findByInstitutionId,
  deactivateKey,
  updateLastUsed,
  findById,
};
