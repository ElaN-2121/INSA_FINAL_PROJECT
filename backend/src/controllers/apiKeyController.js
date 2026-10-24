const apiKeyService = require('../services/apiKeyService');
const { success, error } = require('../utils/apiResponse');

async function generateKey(req, res) {
  const { institutionId } = req.params;
  const { label, expiresAt } = req.body;

  if (!label) {
    return error(res, 'Label is required', 400);
  }

  try {
    const result = await apiKeyService.generateApiKey(
      institutionId,
      label,
      req.user.id,
      expiresAt || null
    );

    return success(
      res,
      {
        ...result,
        warning: 'Save this key now. It will not be shown again.',
      },
      'API key generated successfully',
      201
    );
  } catch (err) {
    throw err;
  }
}

async function listKeys(req, res) {
  const { institutionId } = req.params;
  const keys = await apiKeyService.listKeys(institutionId);
  return success(res, keys, 'API keys retrieved successfully');
}

async function revokeKey(req, res) {
  const { keyId } = req.params;

  const revoked = await apiKeyService.revokeKey(keyId, req.user.id);
  if (!revoked) {
    return error(res, 'API key not found', 404);
  }

  return success(res, revoked, 'API key revoked successfully');
}

module.exports = {
  generateKey,
  listKeys,
  revokeKey,
};
