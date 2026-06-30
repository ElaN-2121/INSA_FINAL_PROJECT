const { query } = require('../config/database');

async function findById(id) {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function findByEmail(email) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

async function findByFaydaId(faydaId) {
  const result = await query('SELECT * FROM users WHERE fayda_id = $1', [faydaId]);
  return result.rows[0] || null;
}

async function findByFaydaIdOrNull(faydaId) {
  const result = await query('SELECT * FROM users WHERE fayda_id = $1', [faydaId]);
  return result.rows[0] || null;
}

async function countByRole(role) {
  const result = await query('SELECT COUNT(*)::int AS count FROM users WHERE role = $1', [role]);
  return result.rows[0].count;
}

async function createUser({ email, password_hash, role, full_name, fayda_id, institution_id, company_name }) {
  const result = await query(
    `INSERT INTO users (email, password_hash, role, full_name, fayda_id, institution_id, company_name)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [email, password_hash, role, full_name, fayda_id, institution_id, company_name]
  );
  return result.rows[0];
}

async function updateUser(id, fields) {
  const allowedFields = ['email', 'password_hash', 'role', 'full_name', 'fayda_id', 'institution_id', 'status'];
  const entries = Object.entries(fields).filter(([key]) => allowedFields.includes(key));

  if (entries.length === 0) {
    return null;
  }

  const setClauses = entries.map(([key], index) => `${key} = $${index + 2}`);
  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  const values = [id, ...entries.map(([, value]) => value)];

  const result = await query(
    `UPDATE users SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

async function findByRole(role) {
  const result = await query('SELECT * FROM users WHERE role = $1', [role]);
  return result.rows;
}

async function deactivateUser(id) {
  const result = await query(
    `UPDATE users SET status = 'INACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  findById,
  findByEmail,
  findByFaydaId,
  findByFaydaIdOrNull,
  countByRole,
  createUser,
  updateUser,
  findByRole,
  deactivateUser,
};
