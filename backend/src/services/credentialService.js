const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { getClient } = require('../config/database');
const { query } = require('../config/database');
const credentialRepository = require('../repositories/credentialRepository');
const csvBatchRepository = require('../repositories/csvBatchRepository');
const notificationRepository = require('../repositories/notificationRepository');
const institutionRepository = require('../repositories/institutionRepository');
const auditService = require('./auditService');
const authService = require('./authService');
const { parseCsvBuffer, validateCsvRows } = require('./csvService');
const { canonicalize, hashCredential } = require('../crypto/hash');
const { signCredential } = require('../crypto/sign');
const { loadPrivateKey } = require('../crypto/keyManager');

async function findOrCreateStudent(client, row) {
  const existing = await client.query('SELECT * FROM users WHERE fayda_id = $1', [row.fayda_id]);
  if (existing.rows[0]) {
    return existing.rows[0];
  }

  const passwordHash = await authService.hashPassword(crypto.randomBytes(16).toString('hex'));
  const created = await client.query(
    `INSERT INTO users (email, password_hash, role, full_name, fayda_id)
     VALUES ($1, $2, 'STUDENT', $3, $4)
     RETURNING *`,
    [row.email, passwordHash, row.full_name, row.fayda_id]
  );
  return created.rows[0];
}

async function stageBatch(institutionId, registrarId, file) {
  const rows = await parseCsvBuffer(file.buffer);
  const { valid, invalid } = validateCsvRows(rows);

  const institution = await institutionRepository.findById(institutionId);
  if (!institution) {
    throw new Error('Institution not found');
  }

  const batch = await csvBatchRepository.createBatch({
    institutionId,
    uploadedBy: registrarId,
    filename: file.originalname,
    fileData: valid,
    totalRecords: rows.length,
  });

  return {
    batchId: batch.id,
    totalRecords: rows.length,
    validCount: valid.length,
    invalidCount: invalid.length,
    valid,
    invalid,
  };
}

async function issueBatch(batchId, registrarId) {
  const batch = await csvBatchRepository.findById(batchId);
  if (!batch) {
    throw new Error('Batch not found');
  }
  if (batch.status !== 'STAGED') {
    throw new Error('Batch is not in STAGED status');
  }

  const institution = await institutionRepository.findById(batch.institution_id);
  if (!institution) {
    throw new Error('Institution not found');
  }

  const privateKey = await loadPrivateKey(batch.institution_id);
  const validRows = Array.isArray(batch.file_data) ? batch.file_data : [];
  const issueDate = new Date().toISOString().split('T')[0];

  const client = await getClient();
  const issuedCredentials = [];

  try {
    await client.query('BEGIN');

    for (const row of validRows) {
      const student = await findOrCreateStudent(client, row);
      const serialNumber = `CRED-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;

      const canonicalData = {
        degree_name: row.degree_name,
        graduation_year: row.graduation_year,
        gpa: row.gpa,
        holder_name: row.full_name,
        institution_name: institution.name,
        issue_date: issueDate,
        major: row.major,
        serial_number: serialNumber,
      };

      const canonicalString = canonicalize(canonicalData);
      const credentialHash = hashCredential(canonicalString);
      console.log('ISSUANCE CANONICAL:', canonicalString);
      const digitalSignature = signCredential(canonicalString, privateKey);

      const credential = await credentialRepository.createCredential(
        {
          serial_number: serialNumber,
          holder_id: student.id,
          institution_id: batch.institution_id,
          degree_name: row.degree_name,
          major: row.major,
          graduation_year: row.graduation_year,
          gpa: row.gpa,
          issue_date: issueDate,
          credential_hash: credentialHash,
          digital_signature: digitalSignature,
          issued_by: registrarId,
        },
        client
      );

      await notificationRepository.createNotification(
        {
          userId: student.id,
          type: 'CREDENTIAL_ISSUED',
          message: `Your credential from ${institution.name} has been issued.`,
        },
        client
      );

      await auditService.log(
        {
          userId: registrarId,
          action: auditService.CREDENTIAL_ISSUED,
          entityType: 'credential',
          entityId: credential.id,
          ipAddress: null,
          details: { serial_number: serialNumber, holder_fayda_id: row.fayda_id },
        },
        client
      );

      issuedCredentials.push(credential);
    }

    await csvBatchRepository.updateBatch(
      batchId,
      { status: 'ISSUED', processed_records: issuedCredentials.length },
      client
    );

    await client.query('COMMIT');

    return {
      issued: issuedCredentials.length,
      credentials: issuedCredentials,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getCredentialsByHolder(userId) {
  return credentialRepository.findByHolderId(userId);
}

async function getCredentialsByInstitution(institutionId) {
  return credentialRepository.findByInstitutionId(institutionId);
}

async function revokeCredential(credentialId, revokedBy, reason) {
  const credential = await credentialRepository.findById(credentialId);
  if (!credential) {
    return null;
  }
  if (credential.status !== 'ACTIVE') {
    throw new Error('Credential is not active');
  }

  const updated = await credentialRepository.updateStatus(credentialId, 'REVOKED');
  await credentialRepository.insertRevocation(credentialId, revokedBy, reason);

  await notificationRepository.createNotification({
    userId: credential.holder_id,
    type: 'CREDENTIAL_REVOKED',
    message: 'Your credential has been revoked.',
  });

  await auditService.log({
    userId: revokedBy,
    action: auditService.CREDENTIAL_REVOKED,
    entityType: 'credential',
    entityId: credentialId,
    ipAddress: null,
    details: { reason },
  });

  return updated;
}

async function getCredentialWithDetails(credentialId) {
  return credentialRepository.findWithDetails(credentialId);
}

async function findInstitutionRegistrar(institutionId) {
  const result = await query(
    `SELECT id FROM users WHERE institution_id = $1 AND role = 'UNIVERSITY' LIMIT 1`,
    [institutionId]
  );
  return result.rows[0]?.id || null;
}

async function issueFromApi(institutionId, studentsArray) {
  const { valid, invalid } = validateCsvRows(studentsArray);

  if (invalid.length > 0) {
    return { success: false, invalid };
  }

  const institution = await institutionRepository.findById(institutionId);
  if (!institution) {
    throw new Error('Institution not found');
  }

  if (institution.status !== 'ACTIVE') {
    throw new Error('Institution is not active');
  }

  const registrarId = await findInstitutionRegistrar(institutionId);
  if (!registrarId) {
    throw new Error('No registrar found for institution');
  }

  const batch = await csvBatchRepository.createBatch({
    institutionId,
    uploadedBy: registrarId,
    filename: `api-issue-${Date.now()}.json`,
    fileData: valid,
    totalRecords: valid.length,
  });

  const result = await issueBatch(batch.id, registrarId);

  return {
    success: true,
    issued: result.issued,
    credentials: result.credentials,
  };
}

module.exports = {
  stageBatch,
  issueBatch,
  issueFromApi,
  getCredentialsByHolder,
  getCredentialsByInstitution,
  revokeCredential,
  getCredentialWithDetails,
};
