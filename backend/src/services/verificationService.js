const credentialRepository = require('../repositories/credentialRepository');
const verificationRepository = require('../repositories/verificationRepository');
const institutionRepository = require('../repositories/institutionRepository');
const notificationRepository = require('../repositories/notificationRepository');
const userRepository = require('../repositories/userRepository');
const auditService = require('./auditService');
const { canonicalize, hashCredential } = require('../crypto/hash');
const { verifySignature } = require('../crypto/verify');

function formatIssueDate(date) {
  if (!date) return '';
  
  if (date instanceof Date) {
    // Extract date parts using LOCAL time, not UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Already a string like "2026-06-29" or "2026-06-29T00:00:00.000Z"
  return String(date).split('T')[0];
}

function mapReasonToLogResult(reason) {
  const mapping = {
    VERIFIED: 'VALID',
    CREDENTIAL_NOT_FOUND: 'NOT_FOUND',
    UNTRUSTED_INSTITUTION: 'UNTRUSTED',
    NO_PUBLIC_KEY: 'UNTRUSTED',
    INTEGRITY_VIOLATION: 'INTEGRITY_VIOLATION',
    INVALID_SIGNATURE: 'INVALID',
    CREDENTIAL_REVOKED: 'REVOKED',
  };
  return mapping[reason] || 'INVALID';
}

function buildCanonicalObject(credential) {
  return {
    degree_name: credential.degree_name,
    graduation_year: Number(credential.graduation_year),
    gpa: parseFloat(credential.gpa),
    holder_name: credential.holder_name,
    institution_name: credential.institution_name,
    issue_date: formatIssueDate(credential.issue_date),
    major: credential.major,
    serial_number: credential.serial_number,
  };
}

async function verifyCredential(credentialId) {
  const credential = await credentialRepository.findWithDetails(credentialId);

  if (!credential) {
    return { valid: false, reason: 'CREDENTIAL_NOT_FOUND', step: 1 };
  }

  if (credential.institution_status !== 'ACTIVE') {
    return {
      valid: false,
      reason: 'UNTRUSTED_INSTITUTION',
      step: 2,
      institution: credential.institution_name,
    };
  }

  const publicKey = await institutionRepository.getActivePublicKey(credential.institution_id);
  if (!publicKey) {
    return { valid: false, reason: 'NO_PUBLIC_KEY', step: 3 };
  }

  const canonicalData = buildCanonicalObject(credential);
  const canonicalString = canonicalize(canonicalData);
  console.log('VERIFICATION CANONICAL:', canonicalString);
  const computedHash = hashCredential(canonicalString);

  if (computedHash !== credential.credential_hash) {
    return { valid: false, reason: 'INTEGRITY_VIOLATION', step: 4 };
  }

  const signatureValid = verifySignature(
    canonicalString,
    credential.digital_signature,
    publicKey
  );

  if (!signatureValid) {
    return { valid: false, reason: 'INVALID_SIGNATURE', step: 5 };
  }

  if (credential.status !== 'ACTIVE') {
    return { valid: false, reason: 'CREDENTIAL_REVOKED', step: 6 };
  }

  return {
    valid: true,
    reason: 'VERIFIED',
    credential: {
      id: credential.id,
      serial_number: credential.serial_number,
      degree_name: credential.degree_name,
      major: credential.major,
      graduation_year: credential.graduation_year,
      gpa: credential.gpa,
      issue_date: formatIssueDate(credential.issue_date),
      holder_name: credential.holder_name,
      institution_name: credential.institution_name,
      status: credential.status,
    },
  };
}

async function requestVerification(credentialId, employerId) {
  const credential = await credentialRepository.findById(credentialId);
  if (!credential) {
    return null;
  }

  const employer = await userRepository.findById(employerId);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const request = await verificationRepository.createRequest({
    credentialId,
    employerId,
    studentId: credential.holder_id,
    expiresAt,
  });

  await notificationRepository.createNotification({
    userId: credential.holder_id,
    type: 'VERIFICATION_REQUESTED',
    message: `Employer ${employer.full_name} has requested to verify your credential.`,
  });

  await auditService.log({
    userId: employerId,
    action: auditService.VERIFICATION_REQUESTED,
    entityType: 'verification_request',
    entityId: request.id,
    ipAddress: null,
    details: { credential_id: credentialId },
  });

  return request;
}

async function approveRequest(requestId, studentId) {
  const request = await verificationRepository.findById(requestId);
  if (!request || request.student_id !== studentId) {
    return null;
  }
  if (request.status !== 'PENDING') {
    throw new Error('Request is not pending');
  }

  const updated = await verificationRepository.updateStatus(
    requestId,
    'APPROVED',
    new Date()
  );

  await notificationRepository.createNotification({
    userId: request.employer_id,
    type: 'VERIFICATION_APPROVED',
    message: 'Student has approved your verification request.',
  });

  await auditService.log({
    userId: studentId,
    action: auditService.VERIFICATION_APPROVED,
    entityType: 'verification_request',
    entityId: requestId,
    ipAddress: null,
    details: null,
  });

  return updated;
}

async function denyRequest(requestId, studentId) {
  const request = await verificationRepository.findById(requestId);
  if (!request || request.student_id !== studentId) {
    return null;
  }
  if (request.status !== 'PENDING') {
    throw new Error('Request is not pending');
  }

  const updated = await verificationRepository.updateStatus(
    requestId,
    'DENIED',
    new Date()
  );

  await notificationRepository.createNotification({
    userId: request.employer_id,
    type: 'VERIFICATION_DENIED',
    message: 'Student has denied your verification request.',
  });

  await auditService.log({
    userId: studentId,
    action: auditService.VERIFICATION_DENIED,
    entityType: 'verification_request',
    entityId: requestId,
    ipAddress: null,
    details: null,
  });

  return updated;
}

async function completeVerification(credentialId, requestId = null) {
  const result = await verifyCredential(credentialId);

  await verificationRepository.createLog({
    requestId,
    credentialId,
    result: mapReasonToLogResult(result.reason),
    details: result,
  });

  if (requestId) {
    await verificationRepository.updateStatus(requestId, 'COMPLETED', new Date());
  }

  await auditService.log({
    userId: null,
    action: auditService.VERIFICATION_COMPLETED,
    entityType: 'credential',
    entityId: credentialId,
    ipAddress: null,
    details: { result: result.reason },
  });

  return result;
}

async function getEmployerHistory(employerId) {
  return verificationRepository.findByEmployerId(employerId);
}

async function getPendingRequests(studentId) {
  return verificationRepository.findPendingByStudentId(studentId);
}

module.exports = {
  verifyCredential,
  requestVerification,
  approveRequest,
  denyRequest,
  completeVerification,
  getEmployerHistory,
  getPendingRequests,
};
