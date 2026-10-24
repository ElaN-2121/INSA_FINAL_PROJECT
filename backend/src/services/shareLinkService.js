const crypto = require('crypto');
const shareLinkRepository = require('../repositories/shareLinkRepository');
const credentialRepository = require('../repositories/credentialRepository');
const { verifyCredential } = require('./verificationService');

async function generateShareLink(credentialId, studentId, expiresInHours = 48, maxViews = null) {
  const credential = await credentialRepository.findById(credentialId);
  if (!credential || credential.holder_id !== studentId) {
    return null;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  await shareLinkRepository.createShareLink({
    credentialId,
    studentId,
    token,
    expiresAt,
    maxViews,
  });

  return {
    shareUrl: `http://localhost:5173/verify/${token}`,
    token,
    expiresAt,
  };
}

async function verifyShareLink(token) {
  const link = await shareLinkRepository.findByToken(token);

  if (!link || !link.is_active) {
    return { valid: false, reason: 'LINK_NOT_FOUND' };
  }

  if (new Date() > new Date(link.expires_at)) {
    return { valid: false, reason: 'LINK_EXPIRED' };
  }

  if (link.max_views !== null && link.view_count >= link.max_views) {
    return { valid: false, reason: 'LINK_LIMIT_REACHED' };
  }

  const updated = await shareLinkRepository.incrementViewCount(link.id);
  const verificationResult = await verifyCredential(link.credential_id, null);

  return {
    ...verificationResult,
    expiresAt: link.expires_at,
    viewCount: updated.view_count,
  };
}

async function listStudentLinks(studentId) {
  return shareLinkRepository.findByStudentId(studentId);
}

async function revokeLink(linkId, studentId) {
  const link = await shareLinkRepository.findById(linkId);
  if (!link || link.student_id !== studentId) {
    return null;
  }

  return shareLinkRepository.deactivateLink(linkId);
}

module.exports = {
  generateShareLink,
  verifyShareLink,
  listStudentLinks,
  revokeLink,
};
