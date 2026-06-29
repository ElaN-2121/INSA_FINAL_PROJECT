const multer = require('multer');
const credentialService = require('../services/credentialService');
const { success, error } = require('../utils/apiResponse');

const upload = multer({ storage: multer.memoryStorage() });

async function uploadBatch(req, res) {
  if (!req.file) {
    return error(res, 'CSV file is required', 400);
  }

  if (!req.user.institution_id) {
    return error(res, 'Registrar is not linked to an institution', 400);
  }

  try {
    const staged = await credentialService.stageBatch(
      req.user.institution_id,
      req.user.id,
      req.file
    );
    return success(res, staged, 'Batch staged successfully', 201);
  } catch (err) {
    throw err;
  }
}

async function issueBatch(req, res) {
  try {
    const result = await credentialService.issueBatch(req.params.batchId, req.user.id);
    return success(res, result, 'Credentials issued successfully');
  } catch (err) {
    if (err.message === 'Batch not found') {
      return error(res, 'Batch not found', 404);
    }
    if (err.message === 'Batch is not in STAGED status') {
      return error(res, 'Batch is not in STAGED status', 400);
    }
    throw err;
  }
}

async function getMyCredentials(req, res) {
  const credentials = await credentialService.getCredentialsByHolder(req.user.id);
  return success(res, credentials, 'Credentials retrieved successfully');
}

async function getInstitutionCredentials(req, res) {
  if (!req.user.institution_id) {
    return error(res, 'Registrar is not linked to an institution', 400);
  }

  const credentials = await credentialService.getCredentialsByInstitution(req.user.institution_id);
  return success(res, credentials, 'Institution credentials retrieved successfully');
}

const getCredentialById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate it looks like a UUID before querying
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return error(res, 'Invalid credential ID format', 400);
    }

    const credential = await credentialService.getCredentialWithDetails(id);
    if (!credential) {
      return error(res, 'Credential not found', 404);
    }
    return success(res, credential);
  } catch (err) {
    next(err);
  }
};

async function revokeCredential(req, res) {
  const { reason } = req.body;

  try {
    const credential = await credentialService.revokeCredential(
      req.params.id,
      req.user.id,
      reason || null
    );
    if (!credential) {
      return error(res, 'Credential not found', 404);
    }
    return success(res, credential, 'Credential revoked successfully');
  } catch (err) {
    if (err.message === 'Credential is not active') {
      return error(res, 'Credential is not active', 400);
    }
    throw err;
  }
}

module.exports = {
  upload,
  uploadBatch,
  issueBatch,
  getMyCredentials,
  getInstitutionCredentials,
  getCredentialById,
  revokeCredential,
};
