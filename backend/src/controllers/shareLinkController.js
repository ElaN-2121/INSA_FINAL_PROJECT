const shareLinkService = require('../services/shareLinkService');
const { success, error } = require('../utils/apiResponse');

async function generateLink(req, res) {
  const { credentialId, expiresInHours, maxViews } = req.body;

  if (!credentialId) {
    return error(res, 'credentialId is required', 400);
  }

  const result = await shareLinkService.generateShareLink(
    credentialId,
    req.user.id,
    expiresInHours ?? 48,
    maxViews ?? null
  );

  if (!result) {
    return error(res, 'Credential not found or access denied', 404);
  }

  return success(res, result, 'Share link generated successfully', 201);
}

async function verifyLink(req, res) {
  const { token } = req.params;
  const result = await shareLinkService.verifyShareLink(token);
  return success(res, result, 'Share link verification completed');
}

async function listMyLinks(req, res) {
  const links = await shareLinkService.listStudentLinks(req.user.id);
  return success(res, links, 'Share links retrieved successfully');
}

async function revokeLink(req, res) {
  const { linkId } = req.params;
  const revoked = await shareLinkService.revokeLink(linkId, req.user.id);

  if (!revoked) {
    return error(res, 'Share link not found or access denied', 404);
  }

  return success(res, revoked, 'Share link revoked successfully');
}

module.exports = {
  generateLink,
  verifyLink,
  listMyLinks,
  revokeLink,
};
