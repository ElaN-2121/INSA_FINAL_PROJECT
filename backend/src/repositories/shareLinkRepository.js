const { query } = require('../config/database');

async function createShareLink({ credentialId, studentId, token, expiresAt, maxViews }) {
  const result = await query(
    `INSERT INTO credential_share_links (credential_id, student_id, token, expires_at, max_views)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [credentialId, studentId, token, expiresAt, maxViews ?? null]
  );
  return result.rows[0];
}

async function findByToken(token) {
  const result = await query(
    `SELECT * FROM credential_share_links WHERE token = $1`,
    [token]
  );
  return result.rows[0] || null;
}

async function incrementViewCount(id) {
  const result = await query(
    `UPDATE credential_share_links SET view_count = view_count + 1 WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
}

async function deactivateLink(id) {
  const result = await query(
    `UPDATE credential_share_links SET is_active = FALSE WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
}

async function findByStudentId(studentId) {
  const result = await query(
    `SELECT sl.*, c.serial_number, c.degree_name
     FROM credential_share_links sl
     INNER JOIN credentials c ON c.id = sl.credential_id
     WHERE sl.student_id = $1
     ORDER BY sl.created_at DESC`,
    [studentId]
  );
  return result.rows;
}

async function findByCredentialId(credentialId) {
  const result = await query(
    `SELECT * FROM credential_share_links WHERE credential_id = $1 ORDER BY created_at DESC`,
    [credentialId]
  );
  return result.rows;
}

async function findById(id) {
  const result = await query(
    `SELECT * FROM credential_share_links WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  createShareLink,
  findByToken,
  incrementViewCount,
  deactivateLink,
  findByStudentId,
  findByCredentialId,
  findById,
};
