const apiKeyService = require('../services/apiKeyService');
const { error } = require('../utils/apiResponse');

async function authenticateApiKey(req, res, next) {
  const rawKey = req.headers['x-api-key'];

  if (!rawKey) {
    return error(res, 'Invalid or expired API key', 401);
  }

  try {
    const institution = await apiKeyService.validateApiKey(rawKey);

    if (!institution) {
      return error(res, 'Invalid or expired API key', 401);
    }

    req.institution = {
      id: institution.id,
      name: institution.name,
      status: institution.status,
    };
    req.authType = 'api_key';
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = authenticateApiKey;
