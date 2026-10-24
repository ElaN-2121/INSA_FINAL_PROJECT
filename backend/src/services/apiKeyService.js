const crypto = require('crypto');
const apiKeyRepository = require('../repositories/apiKeyRepository');
const auditService = require('./auditService');

async function generateApiKey(institutionId, label, adminId, expiresAt = null) {
  const fullKey = `ethiocred_${crypto.randomBytes(32).toString('hex')}`;
  const keyPrefix = fullKey.slice(0, 12);
  const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');

  await apiKeyRepository.createApiKey({
    institutionId,
    keyHash,
    keyPrefix,
    label,
    createdBy: adminId,
    expiresAt,
  });

  await auditService.log({
    userId: adminId,
    action: auditService.API_KEY_GENERATED,
    entityType: 'institution',
    entityId: institutionId,
    ipAddress: null,
    details: { label, keyPrefix },
  });

  return { fullKey, keyPrefix, label };
}

async function listKeys(institutionId) {
  return apiKeyRepository.findByInstitutionId(institutionId);
}

async function revokeKey(keyId, adminId) {
  const key = await apiKeyRepository.deactivateKey(keyId);
  if (!key) {
    return null;
  }

  await auditService.log({
    userId: adminId,
    action: auditService.API_KEY_REVOKED,
    entityType: 'institution',
    entityId: key.institution_id,
    ipAddress: null,
    details: { keyId, keyPrefix: key.key_prefix },
  });

  return key;
}

async function validateApiKey(rawKey) {
  if (!rawKey || typeof rawKey !== 'string') {
    return null;
  }

  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const record = await apiKeyRepository.findByKeyHash(keyHash);

  if (!record || !record.is_active) {
    return null;
  }

  if (record.expires_at && new Date() > new Date(record.expires_at)) {
    return null;
  }

  await apiKeyRepository.updateLastUsed(record.id);

  return {
    id: record.institution_id,
    name: record.institution_name,
    status: record.institution_status,
  };
}

module.exports = {
  generateApiKey,
  listKeys,
  revokeKey,
  validateApiKey,
};
