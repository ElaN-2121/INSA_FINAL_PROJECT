const { query, getClient } = require('../config/database');
const { canonicalize, hashCredential } = require('../crypto/hash');
const { verifySignature } = require('../crypto/verify');
const { signCredential } = require('../crypto/sign');
const { generateRSAKeyPair } = require('../crypto/keyManager');
const verificationService = require('./verificationService');

function formatIssueDate(date) {
  if (!date) return '';
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String(date).split('T')[0];
}

function buildCanonicalFields(credential) {
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

/**
 * DEMO 1: Credential Tampering Attack
 */
const demonstrateTamperingAttack = async (credentialId) => {
  const result = await query(
    `SELECT c.*, u.full_name AS holder_name, i.name AS institution_name
     FROM credentials c
     JOIN users u ON c.holder_id = u.id
     JOIN institutions i ON c.institution_id = i.id
     WHERE c.id = $1`,
    [credentialId]
  );

  if (result.rows.length === 0) {
    throw new Error('Credential not found. Please provide a valid credential ID.');
  }

  const original = result.rows[0];

  const keyResult = await query(
    `SELECT public_key FROM institution_keys
     WHERE institution_id = $1 AND status = 'ACTIVE'
     ORDER BY key_version DESC LIMIT 1`,
    [original.institution_id]
  );

  if (keyResult.rows.length === 0) {
    throw new Error('No active public key found for this institution.');
  }

  const publicKey = keyResult.rows[0].public_key;
  const originalCanonical = canonicalize(buildCanonicalFields(original));

  const originalSignatureValid = verifySignature(
    originalCanonical,
    original.digital_signature,
    publicKey
  );
  const originalHashValid =
    originalSignatureValid &&
    hashCredential(originalCanonical) === original.credential_hash;

  const tamperedGpa = String(
    Math.min(4.0, parseFloat(original.gpa) + 0.5)
  );

  const tamperedFields = {
    ...buildCanonicalFields(original),
    gpa: parseFloat(tamperedGpa),
  };
  const tamperedCanonical = canonicalize(tamperedFields);

  const tamperedHashValid =
    hashCredential(tamperedCanonical) === original.credential_hash;
  const signatureValid = verifySignature(
    tamperedCanonical,
    original.digital_signature,
    publicKey
  );

  return {
    attack: 'CREDENTIAL_TAMPERING',
    description: 'Attacker modified GPA after issuance',
    originalGpa: original.gpa,
    tamperedGpa,
    originalHashValid,
    tamperedHashValid,
    signatureValid,
    result: 'ATTACK_DETECTED',
    explanation:
      'SHA-256 hash mismatch detected. RSA signature verification failed because the credential data no longer matches the signed original.',
  };
};

/**
 * DEMO 2: Rogue Issuer Attack
 */
const demonstrateRogueIssuerAttack = async () => {
  const { publicKey: roguePublicKey, privateKey: roguePrivateKey } =
    generateRSAKeyPair();

  const today = new Date().toISOString().split('T')[0];
  const fakeCredentialData = {
    holder_name: 'Fake Graduate',
    degree_name: 'PhD in Computer Science',
    major: 'AI',
    graduation_year: 2024,
    gpa: 4.0,
    institution_name: 'Fake University',
    issue_date: today,
    serial_number: 'FAKE-001',
  };

  const canonicalString = canonicalize(fakeCredentialData);
  const rogueSignature = signCredential(canonicalString, roguePrivateKey);

  const trustCheck = await query(
    `SELECT id FROM institutions WHERE name = $1`,
    ['Fake University']
  );

  const institutionInTrustRegistry = trustCheck.rows.length > 0;
  const signatureWithRogueKey = verifySignature(
    canonicalString,
    rogueSignature,
    roguePublicKey
  );

  return {
    attack: 'ROGUE_ISSUER',
    description: 'Attacker created credential signed with their own private key',
    fakeInstitution: 'Fake University',
    institutionInTrustRegistry,
    signatureWithRogueKey,
    result: 'ATTACK_DETECTED',
    explanation:
      'Even though the signature is mathematically valid for the rogue key, the institution is not in the Trust Registry. Verification is rejected at institution trust check.',
  };
};

/**
 * DEMO 3: Revocation Bypass Attempt
 */
const demonstrateRevocationBypassAttempt = async (credentialId) => {
  const client = await getClient();

  try {
    const existing = await client.query(
      `SELECT id, status FROM credentials WHERE id = $1`,
      [credentialId]
    );

    if (existing.rows.length === 0) {
      throw new Error('Credential not found. Please provide a valid credential ID.');
    }

    if (existing.rows[0].status !== 'ACTIVE') {
      throw new Error('Please choose an ACTIVE credential for this demonstration.');
    }

    const beforeResult = await verificationService.verifyCredential(credentialId);
    const verificationBeforeRevocation = {
      valid: beforeResult.valid,
      reason: beforeResult.reason,
    };

    const adminResult = await client.query(
      `SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1`
    );
    const revokedBy = adminResult.rows[0]?.id;

    await client.query('BEGIN');

    await client.query(
      `UPDATE credentials SET status = 'REVOKED' WHERE id = $1`,
      [credentialId]
    );
    await client.query(
      `INSERT INTO revoked_credentials (credential_id, revoked_by, reason)
       VALUES ($1, $2, $3)`,
      [credentialId, revokedBy, 'Security demonstration — temporary revocation']
    );

    await client.query('COMMIT');

    const afterResult = await verificationService.verifyCredential(credentialId);
    const verificationAfterRevocation = {
      valid: afterResult.valid,
      reason: afterResult.reason,
    };

    await client.query('BEGIN');

    await client.query(
      `UPDATE credentials SET status = 'ACTIVE' WHERE id = $1`,
      [credentialId]
    );
    await client.query(
      `DELETE FROM revoked_credentials WHERE credential_id = $1`,
      [credentialId]
    );

    await client.query('COMMIT');

    return {
      attack: 'REVOCATION_BYPASS',
      description: 'Attacker attempts to use a revoked credential',
      verificationBeforeRevocation,
      verificationAfterRevocation,
      result: 'ATTACK_DETECTED',
      explanation:
        'Even though the RSA signature is still mathematically valid, the revocation check runs after signature verification. Revoked credentials are always rejected regardless of signature validity.',
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  demonstrateTamperingAttack,
  demonstrateRogueIssuerAttack,
  demonstrateRevocationBypassAttempt,
};
