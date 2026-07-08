const multer = require('multer');
const credentialService = require('../services/credentialService');
const credentialRepository = require('../repositories/credentialRepository');
const verificationRepository = require('../repositories/verificationRepository');
const pdfService = require('../services/pdfService');
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

async function issueFromApi(req, res) {
  const { students } = req.body;

  if (!Array.isArray(students) || students.length === 0) {
    return error(res, 'students array is required and must not be empty', 400);
  }

  if (req.institution.status !== 'ACTIVE') {
    return error(res, 'Institution is not active', 403);
  }

  try {
    const result = await credentialService.issueFromApi(req.institution.id, students);

    if (!result.success) {
      return error(res, 'Validation failed for one or more student records', 400, result.invalid);
    }

    return success(res, result, 'Credentials issued successfully', 201);
  } catch (err) {
    if (err.message === 'Institution not found') {
      return error(res, 'Institution not found', 404);
    }
    if (err.message === 'Institution is not active') {
      return error(res, 'Institution is not active', 403);
    }
    if (err.message === 'No registrar found for institution') {
      return error(res, 'No registrar found for institution', 400);
    }
    throw err;
  }
}

async function getMyVerificationHistory(req, res) {
  const credentials = await credentialRepository.findByHolderId(req.user.id);
  const credentialIds = credentials.map((c) => c.id);

  const logs = await verificationRepository.findByCredentialIds(credentialIds);

  const history = credentials.map((credential) => ({
    credential: {
      id: credential.id,
      serial_number: credential.serial_number,
      degree_name: credential.degree_name,
      institution_name: credential.institution_name,
    },
    verifications: logs.filter((log) => log.credential_id === credential.id),
  }));

  return success(res, history, 'Verification history retrieved successfully');
}

async function downloadCredentialPdf(req, res) {
  const credential = await credentialService.getCredentialWithDetails(req.params.id);

  if (!credential) {
    return error(res, 'Credential not found', 404);
  }

  const isHolder = req.user.role === 'STUDENT' && credential.holder_id === req.user.id;
  const isInstitution =
    req.user.role === 'UNIVERSITY' && credential.institution_id === req.user.institution_id;
  const isAdmin = req.user.role === 'ADMIN';

  if (!isHolder && !isInstitution && !isAdmin) {
    return error(res, 'Forbidden - insufficient permissions', 403);
  }

  const pdfBuffer = await pdfService.generateCredentialPdf(credential);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="credential-${credential.serial_number}.pdf"`
  );
  return res.end(pdfBuffer);
}

module.exports = {
  upload,
  uploadBatch,
  issueBatch,
  issueFromApi,
  getMyCredentials,
  getInstitutionCredentials,
  getCredentialById,
  revokeCredential,
  getMyVerificationHistory,
  downloadCredentialPdf,
};
