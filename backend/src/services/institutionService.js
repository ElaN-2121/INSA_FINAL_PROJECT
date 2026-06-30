const institutionRepository = require('../repositories/institutionRepository');
const userRepository = require('../repositories/userRepository');
const authService = require('./authService');
const auditService = require('./auditService');
const crypto = require('crypto');
const { query } = require('../config/database');
const {
  generateRSAKeyPair,
  encryptPrivateKey,
  generateKeyFingerprint,
} = require('../crypto/keyManager');

async function registerInstitution(data, adminId) {
  const institution = await institutionRepository.createInstitution(data);

  const { publicKey, privateKey } = generateRSAKeyPair();
  const encryptedJson = encryptPrivateKey(privateKey);
  const fingerprint = generateKeyFingerprint(publicKey);

  await institutionRepository.saveKeyPair(
    institution.id,
    publicKey,
    encryptedJson,
    fingerprint
  );

  await auditService.log({
    userId: adminId,
    action: auditService.INSTITUTION_REGISTERED,
    entityType: 'institution',
    entityId: institution.id,
    ipAddress: null,
    details: { name: institution.name },
  });

  return {
    ...institution,
    public_key: publicKey,
    fingerprint,
  };
}

async function approveInstitution(institutionId, adminId) {
  const institution = await institutionRepository.updateStatus(
    institutionId,
    'ACTIVE',
    adminId
  );

  if (!institution) {
    return null;
  }

  await auditService.log({
    userId: adminId,
    action: auditService.INSTITUTION_APPROVED,
    entityType: 'institution',
    entityId: institution.id,
    ipAddress: null,
    details: { name: institution.name },
  });

  return institution;
}

async function suspendInstitution(institutionId, adminId) {
  return institutionRepository.updateStatus(institutionId, 'SUSPENDED', adminId);
}

async function getTrustRegistry() {
  return institutionRepository.getActiveInstitutionsWithPublicKeys();
}

async function getInstitutionById(id) {
  return institutionRepository.findById(id);
}

async function getAllInstitutions() {
  return institutionRepository.getAllInstitutions();
}

async function getPendingInstitutions() {
  const result = await query(
    `SELECT * FROM institutions
     WHERE status IN ('PENDING', 'UNDER_REVIEW')
     ORDER BY created_at DESC`
  );
  return result.rows;
}

async function getAllInstitutionsWithRegistrarCounts() {
  const result = await query(
    `SELECT i.*,
            COUNT(u.id) FILTER (WHERE u.role = 'UNIVERSITY')::int AS registrar_count
     FROM institutions i
     LEFT JOIN users u ON u.institution_id = i.id
     GROUP BY i.id
     ORDER BY i.name`
  );
  return result.rows;
}

async function createRegistrarForInstitution({ full_name, email, institution_id }, adminId) {
  const institution = await institutionRepository.findById(institution_id);
  if (!institution || institution.status !== 'ACTIVE') {
    throw new Error('Institution not found or not yet approved');
  }

  const existingEmail = await userRepository.findByEmail(email);
  if (existingEmail) {
    throw new Error('This email is already registered');
  }

  const temporaryPassword = crypto.randomBytes(8).toString('hex');
  const password_hash = await authService.hashPassword(temporaryPassword);

  const user = await userRepository.createUser({
    email,
    password_hash,
    role: 'UNIVERSITY',
    full_name,
    fayda_id: null,
    institution_id,
    company_name: null,
  });

  await auditService.log({
    userId: adminId,
    action: auditService.REGISTRAR_CREATED,
    entityType: 'user',
    entityId: user.id,
    ipAddress: null,
    details: { institution_id, created_by_admin: adminId },
  });

  return {
    user: authService.formatUserResponse(user),
    temporaryPassword,
  };
}

module.exports = {
  registerInstitution,
  approveInstitution,
  suspendInstitution,
  getTrustRegistry,
  getInstitutionById,
  getAllInstitutions,
  getPendingInstitutions,
  getAllInstitutionsWithRegistrarCounts,
  createRegistrarForInstitution,
};
