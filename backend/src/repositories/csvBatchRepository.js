const { query } = require('../config/database');

async function createBatch({ institutionId, uploadedBy, filename, fileData, totalRecords }, client = null) {
  const db = client || { query };
const result = await query(
  `INSERT INTO csv_batches (institution_id, uploaded_by, filename, file_data, total_records, status)
   VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
  [institutionId, uploadedBy, filename, JSON.stringify(fileData), totalRecords, 'STAGED']
);
  return result.rows[0];
}

async function findById(id, client = null) {
  const db = client || { query };
  const result = await db.query('SELECT * FROM csv_batches WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function updateBatch(id, fields, client = null) {
  const db = client || { query };
  const allowedFields = ['status', 'processed_records', 'file_data', 'total_records'];
  const entries = Object.entries(fields).filter(([key]) => allowedFields.includes(key));

  if (entries.length === 0) {
    return null;
  }

  const setClauses = entries.map(([key], index) => `${key} = $${index + 2}`);
  const values = [id, ...entries.map(([, value]) => value)];

  const result = await db.query(
    `UPDATE csv_batches SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

async function findByInstitutionId(institutionId) {
  const result = await query(
    `SELECT * FROM csv_batches WHERE institution_id = $1 ORDER BY created_at DESC`,
    [institutionId]
  );
  return result.rows;
}

module.exports = {
  createBatch,
  findById,
  updateBatch,
  findByInstitutionId,
};
