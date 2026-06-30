const institutionService = require('../services/institutionService');
const { success, error } = require('../utils/apiResponse');

async function registerInstitution(req, res) {
  const { name, organization_fayda_id, registration_number } = req.body;

  if (!name) {
    return error(res, 'Institution name is required', 400);
  }

  try {
    const institution = await institutionService.registerInstitution(
      { name, organization_fayda_id, registration_number },
      req.user.id
    );
    return success(res, institution, 'Institution registered successfully', 201);
  } catch (err) {
    if (err.code === '23505') {
      return error(res, 'Institution with this Fayda ID or registration number already exists', 409);
    }
    throw err;
  }
}

async function approveInstitution(req, res) {
  const institution = await institutionService.approveInstitution(req.params.id, req.user.id);

  if (!institution) {
    return error(res, 'Institution not found', 404);
  }

  return success(res, institution, 'Institution approved successfully');
}

async function suspendInstitution(req, res) {
  const institution = await institutionService.suspendInstitution(req.params.id, req.user.id);

  if (!institution) {
    return error(res, 'Institution not found', 404);
  }

  return success(res, institution, 'Institution suspended successfully');
}

async function getTrustRegistry(req, res) {
  const registry = await institutionService.getTrustRegistry();
  return success(res, registry, 'Trust registry retrieved successfully');
}

async function getAllInstitutions(req, res) {
  const institutions = await institutionService.getAllInstitutions();
  return success(res, institutions, 'Institutions retrieved successfully');
}

async function getInstitutionById(req, res) {
  const institution = await institutionService.getInstitutionById(req.params.id);

  if (!institution) {
    return error(res, 'Institution not found', 404);
  }

  return success(res, institution, 'Institution retrieved successfully');
}

async function createRegistrar(req, res) {
  const { full_name, email } = req.body;
  const institution_id = req.params.institutionId;

  if (!full_name || !email) {
    return error(res, 'All fields are required', 400);
  }

  try {
    const { user, temporaryPassword } = await institutionService.createRegistrarForInstitution(
      { full_name, email, institution_id },
      req.user.id
    );

    return success(
      res,
      { user, temporaryPassword },
      'Registrar account created. Share the temporaryPassword with the registrar — it will not be shown again.',
      201
    );
  } catch (err) {
    if (
      err.message === 'Institution not found or not yet approved' ||
      err.message === 'This email is already registered'
    ) {
      return error(res, err.message, 409);
    }
    throw err;
  }
}

module.exports = {
  registerInstitution,
  approveInstitution,
  suspendInstitution,
  getTrustRegistry,
  getAllInstitutions,
  getInstitutionById,
  createRegistrar,
};
