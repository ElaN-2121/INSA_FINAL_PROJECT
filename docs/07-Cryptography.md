# EthioCred Cryptography Design

**Document Version:** 1.0

# 1. Introduction

Cryptography is the foundation of trust within the EthioCred platform.

Unlike traditional document verification systems that rely solely on database records, EthioCred uses modern public-key cryptography to provide mathematical proof that an academic credential is authentic, untampered, and issued by a trusted institution.

Every digital credential issued by EthioCred contains a cryptographic digital signature generated using the issuing university's private key.

Any attempt to modify the credential after issuance immediately invalidates this signature.

# 2. Cryptographic Objectives

The cryptographic subsystem has several primary objectives.

## Authenticity

Ensure every credential was issued by a trusted institution.

## Integrity

Detect any modification made after issuance.

## Non-Repudiation

Prevent issuing institutions from denying that they signed a credential.

## Trust

Allow employers to independently verify credentials without contacting the issuing university.

## Scalability

Support thousands of credentials while maintaining fast verification times.

# 3. Cryptographic Architecture

The cryptographic subsystem operates independently of the frontend applications.

```text

University Portal

↓

Issue Credential

↓

Canonicalize Data

↓

SHA-256 Hash

↓

RSA Private Key

↓

Digital Signature

↓

Credential Database

↓

Student Wallet

↓

Employer Verification

↓

RSA Public Key

↓

SHA-256 Verification

↓

Verification Result

```

The frontend never performs cryptographic signing.

All cryptographic operations occur within the backend.

# 4. Core Cryptographic Algorithms

EthioCred uses industry-standard cryptographic algorithms.

| Algorithm | Purpose |

|-----------|---------|

| SHA-256 | Generate deterministic message digest |

| RSA-2048 / RSA-4096 | Digital signatures |

| AES-256-GCM | Encrypt university private keys at rest |

| bcrypt | Password hashing (authentication subsystem) |

These algorithms are widely adopted, well studied, and supported by Node.js.

# 5. Why Public-Key Cryptography?

Public-key cryptography separates signing from verification.

Each trusted institution owns:

- One private key
- One public key

The private key is secret.

The public key is distributed through the Trust Registry.

```text

Private Key

↓

Sign Credential

↓

Digital Signature

↓

Public Key

↓

Verify Signature

```

Because only the issuing institution possesses the private key, signatures cannot be forged by unauthorized parties.

# 6. Credential Issuance Pipeline

Every credential follows the same cryptographic lifecycle.

```text

Registrar Uploads CSV

↓

Student Record

↓

Canonicalize Payload

↓

SHA-256 Hash

↓

RSA Sign

↓

Credential Stored

↓

Student Wallet

↓

Employer Verification

↓

RSA Verify

↓

Verification Result

```

Every issued credential follows this identical sequence.

# 7. Cryptographic Components

The backend cryptographic subsystem consists of the following components.

| Component | Responsibility |

|-----------|----------------|

| Hashing Service | Generates SHA-256 hashes |

| Signing Service | Creates RSA digital signatures |

| Verification Engine | Validates signatures |

| Trust Registry | Stores institution public keys |

| Key Vault | Stores encrypted private keys |

| Revocation Registry | Tracks revoked credentials |

| Audit Logger | Records cryptographic operations |

Each component has a clearly defined responsibility, simplifying maintenance and testing.

# 8. Cryptographic Trust Model

EthioCred establishes trust through three entities.

```text

Trusted Institution

↓

Signs Credential

↓

Student Wallet

↓

Shares Credential

↓

Employer

↓

Trust Registry

↓

Verification Engine

↓

Verification Result

```

Trust is established through cryptographic proof rather than manual verification.

# 9. Design Principles

The cryptographic subsystem follows several principles.

### Secure by Default

Every issued credential is digitally signed automatically.

### Private Keys Never Leave the Backend

Private keys are never exposed to frontend applications.

### Public Verification

Verification uses only public information.

No private keys are required.

### Deterministic Processing

Identical credential data always produces identical hashes before signing.

### Separation of Responsibilities

Hashing, signing, verification, storage, and revocation are implemented as independent services.

# 10. Security Assumptions

The security of EthioCred depends on several assumptions.

- Trusted institutions protect their private keys.
- Public keys stored in the Trust Registry are authentic.
- Cryptographic algorithms remain computationally secure.
- Backend servers are protected against unauthorized access.
- Database integrity is maintained.

If a private key is compromised, the institution can be revoked through the Trust Registry.

# 11. Cryptographic Workflow Overview

The complete lifecycle is summarized below.

```text

Institution Registration

↓

Generate RSA Keys

↓

Store Public Key

↓

Encrypt Private Key

↓

Issue Credential

↓

Generate Signature

↓

Store Credential

↓

Student Shares Credential

↓

Employer Verification

↓

Integrity Validation

↓

Trust Validation

↓

Revocation Check

↓

Verification Decision

```

# 12. Summary

The cryptographic subsystem forms the security backbone of the EthioCred platform.

By combining SHA-256 hashing, RSA digital signatures, encrypted key storage, trusted public-key distribution, and independent verification, EthioCred provides mathematical proof of authenticity and integrity while eliminating reliance on manual credential verification.

The following sections describe each cryptographic process in detail, beginning with data canonicalization and SHA-256 hashing.

# 13. Data Canonicalization

Before a credential can be digitally signed, its contents must first be converted into a consistent and deterministic format.

This process is known as **canonicalization**.

Canonicalization ensures that identical credential data always produces the exact same byte sequence before hashing.

Without canonicalization, two identical credentials formatted differently could produce different hashes, causing signature verification to fail.

# Why Canonicalization is Necessary

Consider the following JSON objects.

Example A

```json

{

  "name": "Abebe",

  "gpa": 3.75,

  "major": "Software Engineering"

}

```

Example B

```json

{

  "major": "Software Engineering",

  "name": "Abebe",

  "gpa": 3.75

}

```

Although both objects contain the same information, their internal ordering differs.

If hashed directly, they may produce different hash values.

Canonicalization standardizes the structure before hashing.

# 14. Canonical Credential Format

Before signing, every student record is converted into a standardized payload.

Example:

```json

{

  "issuerId": "AAU-001",

  "holderFaydaId": "123456789012",

  "studentName": "Abebe Kebede",

  "major": "Software Engineering",

  "gpa": 3.75,

  "graduationDate": "2026-07-05",

  "serialNumber": "AAU-2026-0041"

}

```

The fields appear in a fixed order.

Additional formatting rules include:

- UTF-8 encoding
- Consistent field names
- No unnecessary whitespace
- ISO 8601 date format
- Standard decimal representation

# 15. Canonicalization Workflow

```text

Student Record

↓

Validate Fields

↓

Normalize Values

↓

Order Fields

↓

Convert to JSON String

↓

UTF-8 Encoding

↓

Canonical Data

```

Only the canonical representation proceeds to the hashing stage.

# 16. SHA-256 Hashing

After canonicalization, the backend computes a SHA-256 hash of the credential.

SHA-256 belongs to the SHA-2 family of cryptographic hash functions.

Its purpose is to produce a fixed-length digital fingerprint representing the credential data.

Example:

```text

Canonical Credential

↓

SHA-256

↓

256-bit Hash

```

The resulting hash uniquely represents the credential's contents.

# 17. Properties of SHA-256

SHA-256 was selected because it provides several important security properties.

| Property | Description |

|----------|-------------|

| Deterministic | Same input always produces the same hash |

| One-Way | Original data cannot be recovered from the hash |

| Avalanche Effect | Tiny input changes produce completely different hashes |

| Collision Resistant | Extremely difficult to find two different inputs with the same hash |

| Efficient | Fast enough for large-scale credential processing |

These properties make SHA-256 ideal for integrity verification.

# 18. Example Hash Generation

Example credential:

```json

{

  "studentName": "Abebe Kebede",

  "major": "Software Engineering",

  "gpa": 3.75

}

```

Canonical string:

```text

{"studentName":"Abebe Kebede","major":"Software Engineering","gpa":3.75}

```

SHA-256 output (hexadecimal):

```text

e7e76f96f6d86e5fd6e4f9fd3d4d93b9dfb1d75c0fd67db3d80b1bbdb4fd2df3

```

The actual value will differ depending on the complete credential payload.

# 19. Avalanche Effect

One of SHA-256's strongest properties is the avalanche effect.

Changing even a single character completely changes the resulting hash.

Example:

Original GPA

```text

3.75

```

Modified GPA

```text

3.95

```

Hash comparison:

```text

Original

↓

e7e76f96...

Modified

↓

91a54cd2...

```

Although only one value changed, the resulting hashes are entirely different.

This property enables EthioCred to detect credential tampering immediately.

# 20. Node.js Hash Generation

The backend generates hashes using Node.js' built-in `crypto` module.

Conceptual implementation:

```javascript

const crypto = require("crypto");

const canonicalData = JSON.stringify(payload);

const hash = crypto

  .createHash("sha256")

  .update(canonicalData)

  .digest("hex");

```

The generated hash is passed directly to the digital signing service.

# 21. Hashing Pipeline

The complete hashing process is illustrated below.

```text

Credential Data

↓

Validation

↓

Canonicalization

↓

JSON Serialization

↓

SHA-256

↓

Message Digest

↓

RSA Signing

```

Hashing always occurs before digital signing.

# 22. Why Hash Instead of Signing the Entire File?

Signing the hash rather than the complete credential provides several advantages.

| Benefit | Explanation |

|----------|-------------|

| Faster | Fixed-size hash regardless of credential size |

| Efficient | RSA signs a small digest instead of a large payload |

| Standard Practice | Follows established digital signature standards |

| Integrity | Any data modification changes the hash immediately |

This approach is used in modern cryptographic protocols and digital certificate systems.

# 23. Relationship Between Hashing and Digital Signatures

Hashing alone does not prove who created a credential.

Instead:

- SHA-256 creates a fingerprint of the credential.
- RSA signs that fingerprint using the university's private key.
- Employers later recompute the fingerprint and verify the signature using the university's public key.

This combination provides both integrity and authenticity.

# 24. Role in Tampering Detection

The Tampering Attack Demonstration relies directly on SHA-256.

Scenario:

```text

Original Credential

↓

SHA-256

↓

RSA Signature

↓

Student Modifies GPA

↓

Employer Verification

↓

New SHA-256

↓

Compare with Signed Hash

↓

Mismatch

↓

Verification Failed

```

Even though the original digital signature remains unchanged, the modified credential produces a different hash, causing signature verification to fail.

This demonstrates how EthioCred detects unauthorized modifications without relying on manual inspection.

# 25. Summary

Canonicalization and SHA-256 hashing form the first stage of EthioCred's cryptographic pipeline.

By converting every credential into a deterministic format and generating a unique cryptographic fingerprint, the system ensures that even the smallest modification is immediately detectable.

This hash becomes the input for RSA digital signatures, which provide cryptographic proof of authenticity in the next stage of the credential lifecycle.

# 26. Digital Signatures

A digital signature is a cryptographic mechanism that proves:

- The credential was issued by a trusted institution.
- The credential has not been modified after issuance.
- The issuing institution cannot deny issuing the credential (non-repudiation).

Unlike handwritten signatures, digital signatures are mathematically verifiable.

EthioCred uses **RSA-2048** (or RSA-4096 in future deployments) to generate digital signatures for every academic credential.

# 27. Public-Key Cryptography

RSA is an **asymmetric cryptographic algorithm**.

Each trusted institution owns two mathematically related keys.

```text

             RSA Key Pair

      ┌─────────────────────┐

      │                     │

      ▼                     ▼

 Private Key          Public Key

 Secret               Public

 Used for             Used for

 Signing              Verification

```

The private key must remain secret.

The public key is stored inside the Trust Registry and may be shared freely.

# 28. RSA Key Pair Generation

Before an institution can issue credentials, it must generate its RSA key pair.

```text

Institution Registration

↓

Generate RSA Keys

↓

Private Key

↓

Encrypted Key Vault

↓

Public Key

↓

Trust Registry

```

The private key is never exposed outside the backend.

Only the public key is distributed.

# 29. Credential Signing Process

When a university issues a credential, the backend performs the following operations.

```text

Canonical Credential

↓

SHA-256 Hash

↓

RSA Private Key

↓

Digital Signature

↓

Credential Database

```

Only the SHA-256 digest is signed.

The original credential data remains unchanged.

# 30. Digital Signature Workflow

```text

Registrar Uploads CSV

↓

Backend Reads Student Record

↓

Canonicalize JSON

↓

Generate SHA-256 Hash

↓

Load University's Private Key

↓

RSA Sign(Hash)

↓

Generate Digital Signature

↓

Store Credential + Signature

```

This process is repeated for every student within the uploaded graduation batch.

# 31. Credential Structure

A digitally signed credential contains two components.

```json

{

  "credential": {

    "issuerId": "AAU-001",

    "holderFaydaId": "123456789012",

    "studentName": "Abebe Kebede",

    "major": "Software Engineering",

    "gpa": 3.75,

    "graduationDate": "2026-07-05",

    "serialNumber": "AAU-2026-0041"

  },

  "digitalSignature": "5a2cd98fd1ab34..."

}

```

The signature is stored separately from the credential data.

# 32. Node.js Signing Example

EthioCred uses Node.js' built-in `crypto` module for signing.

Conceptual implementation:

```javascript

const crypto = require("crypto");

const signature = crypto.sign(

    "sha256",

    Buffer.from(canonicalData),

    {

        key: privateKey,

        padding: crypto.constants.RSA_PKCS1_PADDING

    }

);

const digitalSignature = signature.toString("base64");

```

The resulting signature is stored together with the credential.

# 33. Verification Process

When an employer verifies a credential, the backend performs the reverse operation.

```text

Credential

↓

Canonicalize

↓

SHA-256 Hash

↓

Retrieve Public Key

↓

Verify Signature

↓

Valid?

↓

YES

↓

Trusted Credential

```

If verification fails, the credential is rejected immediately.

# 34. Verification Workflow

```text

Employer Requests Verification

↓

Retrieve Credential

↓

Retrieve Institution Public Key

↓

Canonicalize Credential

↓

Generate SHA-256 Hash

↓

RSA Verify(Signature)

↓

Valid Signature?

↓

YES

↓

Check Revocation List

↓

Verification Result

```

Verification requires only the institution's public key.

The private key is never needed.

# 35. Node.js Verification Example

Conceptual verification:

```javascript

const crypto = require("crypto");

const verified = crypto.verify(

    "sha256",

    Buffer.from(canonicalData),

    {

        key: publicKey,

        padding: crypto.constants.RSA_PKCS1_PADDING

    },

    Buffer.from(signature, "base64")

);

```

If `verified` equals `true`, the signature is authentic.

# 36. Why RSA Provides Authenticity

Only the issuing institution possesses the private key.

Therefore:

```text

Private Key

↓

Sign Credential

↓

Public Key

↓

Verify Credential

```

An attacker who only knows the public key cannot generate a valid signature.

This guarantees credential authenticity.

# 37. Why RSA Provides Non-Repudiation

Because every signature can only be created using the institution's private key:

- Universities cannot deny issuing a credential.
- Employers can independently verify its origin.
- Students cannot forge credentials.

This property is known as **non-repudiation**.

# 38. Signature Verification Outcomes

The verification engine can produce several outcomes.

| Result | Meaning |

|---------|---------|

| ✅ VALID | Signature is authentic and data is unchanged |

| ❌ INVALID_SIGNATURE | Signature does not match the credential |

| ❌ UNKNOWN_ISSUER | Public key not found in Trust Registry |

| ❌ REVOKED | Credential has been revoked |

| ❌ INSTITUTION_SUSPENDED | Issuer is no longer trusted |

Each result is displayed within the Employer Portal.

# 39. Relationship to Security Demonstrations

RSA signatures enable all three planned attack demonstrations.

### Tampering Attack

```text

Modify GPA

↓

Hash Changes

↓

Signature Verification Fails

```

### Rogue Issuer Attack

```text

Fake University

↓

Unknown Public Key

↓

Trust Registry Rejects Issuer

```

### Revocation Attack

```text

Signature Valid

↓

Credential Revoked

↓

Verification Denied

```

These demonstrations illustrate that integrity, authenticity, and trust are evaluated independently.

# 40. Why RSA Was Selected

RSA was selected because it provides:

| Benefit | Explanation |

|----------|-------------|

| Mature Standard | Used worldwide in PKI and digital certificates |

| Strong Security | Widely trusted and extensively analyzed |

| Public Verification | Anyone with the public key can verify signatures |

| Industry Support | Supported by OpenSSL, Node.js, Java, Python, and major security libraries |

| Scalability | Suitable for large-scale credential verification systems |

Although newer algorithms such as Ed25519 offer performance advantages, RSA remains an excellent choice for demonstrating digital signatures in an academic project and aligns well with existing enterprise Public Key Infrastructure (PKI) deployments.

# 41. Summary

RSA digital signatures provide the mathematical proof that makes EthioCred trustworthy.

By signing the SHA-256 hash of every credential with the issuing university's private key and verifying it using the corresponding public key, the platform guarantees authenticity, integrity, and non-repudiation.

Combined with the Trust Registry and Revocation Registry, RSA forms the cryptographic foundation that enables employers to verify academic credentials without contacting the issuing university directly.

# 42. Cryptographic Key Management

The security of the entire EthioCred platform depends on the protection of cryptographic keys.

While public keys are intentionally distributed through the Trust Registry, private keys must remain confidential at all times.

For this reason, EthioCred implements a secure key management strategy that prevents private keys from being exposed to frontend applications, database tables, or application logs.

# 43. Cryptographic Key Types

Each trusted institution owns exactly one RSA key pair.

| Key | Purpose | Visibility |

|------|----------|------------|

| Private Key | Sign credentials | Secret |

| Public Key | Verify credentials | Public |

The private key never leaves the backend server.

The public key is distributed through the Trust Registry.

# 44. Key Lifecycle

The lifecycle of a university's cryptographic keys is shown below.

```text

Institution Approved

↓

Generate RSA Key Pair

↓

Encrypt Private Key

↓

Store in Secure Vault

↓

Register Public Key

↓

Issue Credentials

↓

Verify Credentials

↓

Rotate / Revoke Keys (Future)

```

Every institution follows this lifecycle before issuing any credentials.

# 45. Private Key Storage

For the MVP, private keys are stored using an encrypted software vault.

The private key is **never stored in plaintext** inside:

- PostgreSQL
- Source code
- GitHub repository
- Log files
- Frontend applications

Instead, the encrypted key is loaded only when required for credential issuance.

# 46. Secure Software Vault

EthioCred implements a lightweight encrypted vault using AES-256-GCM.

```text

University Private Key

↓

AES-256-GCM Encryption

↓

Encrypted Key Blob

↓

Environment Variable

↓

Backend Startup

↓

Decrypt In Memory

↓

Signing Operation

↓

Memory Cleared

```

The plaintext key exists only in server memory during signing.

# 47. Why AES-256-GCM?

AES-256-GCM was selected because it provides both confidentiality and integrity.

| Property | Benefit |

|----------|---------|

| AES-256 | Strong symmetric encryption |

| GCM Mode | Detects unauthorized modification |

| Fast | Suitable for backend operations |

| Industry Standard | Used by cloud providers and enterprise systems |

This prevents attackers from reading or modifying stored private keys.

# 48. Environment Variables

Sensitive cryptographic material is stored outside the application code.

Example:

```env

MASTER_KEY=**************

AAU_PRIVATE_KEY_ENCRYPTED=**************

ASTU_PRIVATE_KEY_ENCRYPTED=**************

```

The `.env` file is never committed to version control.

Example `.gitignore`:

```text

.env

.env.local

.env.production

```

# 49. Private Key Usage

Private keys are loaded only when a registrar authorizes credential issuance.

```text

Issue Batch

↓

Load Encrypted Key

↓

Decrypt

↓

RSA Sign

↓

Destroy Plaintext Copy

↓

Complete

```

This minimizes the exposure window of sensitive cryptographic material.

# 50. Memory Protection

Private keys remain in memory only for the duration of the signing process.

```text

Encrypted Key

↓

Decrypt

↓

Sign Credential

↓

Overwrite Memory

↓

Complete

```

No plaintext key is ever:

- Written to disk
- Sent to the frontend
- Returned through an API
- Logged to the console

# 51. Public Key Distribution

Unlike private keys, public keys are intended to be shared.

They are stored within the Trust Registry.

Example:

| Institution | Public Key |

|-------------|------------|

| Addis Ababa University | RSA Public Key |

| Adama Science and Technology University | RSA Public Key |

Employers retrieve these public keys during verification.

# 52. Trust Registry

The Trust Registry contains every institution authorized to issue credentials.

Example structure:

| Field | Description |

|--------|-------------|

| Institution ID | Unique identifier |

| Institution Name | University name |

| Fayda Organization ID | Registered organization |

| Public Key | RSA public key |

| Status | ACTIVE / SUSPENDED / REVOKED |

Only administrators may modify the Trust Registry.

## Institution Status

Each institution registered in the Trust Registry can exist in one of the following states.

| Status | Description |

|----------|-------------|

| **PENDING** | Institution has applied but is awaiting administrator approval. No credentials may be issued. |

| **ACTIVE** | Institution has been approved and may issue and revoke credentials normally. |

| **SUSPENDED** | Institution is temporarily blocked while under administrative investigation. Previously issued credentials remain verifiable unless otherwise revoked. |

| **COMPROMISED** | The institution's private signing key has been confirmed compromised. New credential issuance is immediately blocked while historical credentials are evaluated using key history. |

| **REVOKED** | Institution has been permanently removed from the Trust Registry. Its public key is no longer trusted for future credential issuance. |

# 53. Institution Onboarding

Before an institution can issue credentials, it must pass an administrative vetting process.

The onboarding workflow is as follows:

```text

University Applies

↓

Submit Government Registration Documents

↓

Administrator Verification

↓

Validate Against Ministry of Education Records

↓

Approve Institution

↓

Generate RSA Key Pair

↓

Store Public Key

↓

Institution Trusted

```

This prevents unauthorized organizations from acting as legitimate credential issuers.

# 54. Key Compromise Response

If an institution suspects that its private key has been compromised, immediate action is taken.

```text

Suspicious Activity Detected

↓

Administrator Investigation

↓

Institution Status = SUSPENDED

↓

Private Key Compromise Confirmed?

↓

No

│

├──► Status = ACTIVE

Yes

│

▼

Status = COMPROMISED

↓

Issue New RSA Key Pair

↓

Register New Public Key

↓

Archive Old Public Key

↓

Status = ACTIVE

```

Once revoked, newly issued credentials signed with the compromised key are rejected.

# 55. Historical Key Support (Future)

Future versions of EthioCred will maintain a historical archive of institution keys.

Example:

| Key | Valid From | Valid Until |

|------|------------|-------------|

| Key A | 2025 | 2027 |

| Key B | 2027 | Current |

This enables the verification engine to distinguish between:

- Credentials legitimately issued before a compromise.
- Fraudulent credentials created after the compromise.

Historical credentials remain verifiable if they were signed before the key was revoked.

# 56. Hardware Security Modules (Future Enhancement)

The MVP uses an encrypted software vault.

For production deployments, universities should store private keys inside **Hardware Security Modules (HSMs)**.

```text

Credential

↓

Hash

↓

HSM

↓

RSA Sign

↓

Signature

```

Benefits include:

- Keys never leave secure hardware.
- Protection against memory extraction attacks.
- Tamper-resistant storage.
- Compliance with enterprise security standards.

# 57. Security Best Practices

EthioCred follows the following key management principles:

- Private keys never leave the backend.
- Public keys are distributed only through the Trust Registry.
- Keys are encrypted at rest using AES-256-GCM.
- Plaintext keys exist only in memory during signing.
- Institutions undergo administrative verification before registration.
- Compromised keys can be revoked immediately.
- Historical key archives support future key rotation.

# 58. Summary

Secure key management is essential to the trust model of EthioCred.

By protecting private keys with encrypted storage, exposing only public keys through the Trust Registry, implementing administrator-controlled institution onboarding, and planning for key rotation and Hardware Security Modules, EthioCred establishes a strong cryptographic foundation that supports both the MVP and future production deployments.

The next section explains how employers verify credentials using the Trust Registry, digital signatures, and revocation checks.

# 59. Verification Engine

The Verification Engine is the core component responsible for determining whether a credential is authentic and trustworthy.

Rather than relying on manual confirmation from universities, the engine performs a series of automated cryptographic checks before returning a verification result.

Every verification request follows the same deterministic workflow.

# 60. Verification Pipeline

```text

Employer Requests Verification

↓

Retrieve Credential

↓

Retrieve Issuer Information

↓

Retrieve Public Key

↓

Canonicalize Credential

↓

Generate SHA-256 Hash

↓

Verify RSA Signature

↓

Validate Trust Registry

↓

Check Revocation Registry

↓

Return Verification Result

```

Each stage must succeed before the credential is considered valid.

# 61. Verification Workflow

The verification process consists of six sequential stages.

### Stage 1 – Credential Retrieval

The backend retrieves the credential using its unique identifier or QR code.

### Stage 2 – Issuer Validation

The issuer ID contained in the credential is used to locate the issuing institution within the Trust Registry.

If no matching institution exists, verification immediately fails.

### Stage 3 – Public Key Retrieval

The verification engine retrieves the institution's RSA public key.

This key is used exclusively for signature verification.

### Stage 4 – Signature Verification

The credential is canonicalized and hashed using SHA-256.

The resulting digest is compared against the digital signature using the issuer's public key.

### Stage 5 – Trust Validation

The system verifies that the institution is currently trusted.

Allowed institution states:

- ACTIVE

Rejected states:

- PENDING
- SUSPENDED
- COMPROMISED
- REVOKED

### Stage 6 – Revocation Check

Finally, the credential's serial number is checked against the Revocation Registry.

Only credentials that pass every stage are considered valid.

# 62. Verification Decision Tree

```text

Credential Received

↓

Credential Exists?

↓

No

↓

NOT FOUND

↓

Yes

↓

Issuer Registered?

↓

No

↓

UNKNOWN ISSUER

↓

Yes

↓

Institution ACTIVE?

↓

No

↓

UNTRUSTED ISSUER

↓

Yes

↓

Signature Valid?

↓

No

↓

TAMPERED

↓

Yes

↓

Credential Revoked?

↓

Yes

↓

REVOKED

↓

No

↓

VALID

```

# 63. Trust Registry

The Trust Registry is the authoritative source of trusted issuing institutions.

Each record contains:

| Field | Description |

|--------|-------------|

| Institution ID | Unique identifier |

| Institution Name | Registered university |

| Public Key | RSA verification key |

| Status | Trust status |

| Created Date | Registration date |

| Last Updated | Latest administrative change |

Only administrators may modify Trust Registry records.

# 64. Administrative Vetting

Before joining the Trust Registry, institutions undergo a manual approval process.

```text

Institution Application

↓

Submit Government Registration Documents

↓

Administrator Review

↓

Verify Against Ministry of Education Records

↓

Approve

↓

Generate RSA Key Pair

↓

Register Public Key

↓

Institution Becomes Trusted

```

This process prevents rogue organizations from issuing fraudulent credentials.

# 65. Revocation Registry

A valid signature alone does not guarantee that a credential remains valid.

EthioCred therefore maintains a Revocation Registry.

Each revoked credential stores:

| Field | Description |

|--------|-------------|

| Credential ID | Revoked credential |

| Serial Number | Certificate identifier |

| Revocation Date | Date revoked |

| Revocation Reason | Administrative explanation |

| Revoked By | Institution administrator |

The Verification Engine consults this registry after successful signature verification.

# 66. Verification Outcomes

The Employer Portal displays one of the following outcomes.

| Status | Meaning |

|--------|---------|

| ✅ VALID | Credential is authentic and trusted |

| ❌ TAMPERED | Credential data has been modified |

| ❌ UNKNOWN ISSUER | Issuer not found in Trust Registry |

| ❌ REVOKED | Credential revoked by institution |

| ❌ UNTRUSTED ISSUER | Institution not currently trusted |

| ❌ NOT FOUND | Credential does not exist |

These messages provide clear feedback without exposing sensitive implementation details.

# 67. QR Code Verification

Every issued credential includes a QR code containing a unique verification reference.

Verification flow:

```text

Employer Scans QR Code

↓

Verification Endpoint

↓

Credential Lookup

↓

Run Verification Pipeline

↓

Display Result

```

The QR code does **not** contain the entire credential or the digital signature. It stores only a secure reference that allows the backend to retrieve the credential and perform server-side verification.

# 68. Audit Logging

Each verification request generates an audit record.

Example:

```json

{

  "event": "CREDENTIAL_VERIFIED",

  "credentialId": "uuid",

  "employerId": "uuid",

  "institutionId": "uuid",

  "result": "VALID",

  "timestamp": "2026-07-15T14:22:11Z"

}

```

This supports security monitoring, forensic analysis, and reporting.

# 69. Summary

The Verification Engine is the operational heart of EthioCred's trust model.

By combining public-key cryptography, the Trust Registry, revocation checks, and audit logging, it enables employers to independently verify academic credentials without contacting issuing institutions.

This automated verification process ensures authenticity, integrity, trust, and accountability while remaining scalable for future nationwide deployment.

# 70. Security Demonstration Framework

EthioCred includes a controlled set of cybersecurity demonstrations that validate the effectiveness of its cryptographic architecture.

These demonstrations simulate realistic attacks against academic credentials and show how the platform detects and prevents unauthorized actions.

Rather than relying solely on theoretical security claims, EthioCred demonstrates its security mechanisms through live verification scenarios.

Each demonstration focuses on a different security property:

| Demonstration | Security Property |

|--------------|-------------------|

| Tampering Attack | Integrity |

| Rogue Issuer Attack | Authenticity & Trust |

| Revocation Attack | Credential Validity |

Together, these demonstrations validate the complete cryptographic pipeline.

# 71. Attack Demonstration Architecture

Every security demonstration follows the same verification process.

```text

Attacker

↓

Modified / Fake Credential

↓

Employer Verification Portal

↓

Verification Engine

↓

Trust Registry

↓

SHA-256 Verification

↓

RSA Signature Verification

↓

Revocation Check

↓

Verification Result

```

Regardless of how an attacker modifies a credential, every verification request passes through the same security pipeline.

# 72. Attack Demonstration 1 – Credential Tampering



## Objective

Demonstrate that any modification to a credential invalidates its digital signature.

## Attack Scenario

A legitimate student possesses a valid academic credential.

The attacker modifies the GPA from:

```

2.80

```

to

```

3.95

```

The original digital signature remains unchanged.

## Attack Workflow

```text

Original Credential

↓

Modify GPA

↓

Original Signature Remains

↓

Employer Requests Verification

↓

SHA-256 Recalculated

↓

Hashes Do Not Match

↓

Verification Failed

```

## Verification Result

The Verification Engine performs the following checks:

1. Canonicalize the modified credential.
2. Generate a new SHA-256 hash.
3. Retrieve the university's public key.
4. Verify the digital signature.

Because the signature was created using the original GPA, verification fails immediately.

## Employer Portal Response

```text

❌ CRITICAL ERROR

Integrity Check Failed

This credential has been modified after issuance.

Digital signature verification failed.

```

## Security Property Demonstrated

✅ Integrity

The system proves that credential contents cannot be modified without invalidating the signature.

# 73. Attack Demonstration 2 – Rogue Issuer

## Objective

Demonstrate that unauthorized institutions cannot issue trusted credentials.

## Attack Scenario

A malicious organization creates its own RSA key pair.

It signs a professionally formatted academic credential using its private key.

However, the institution has never been approved by the EthioCred Trust Registry.

## Attack Workflow

```text

Fake University

↓

Generate RSA Keys

↓

Issue Fake Credential

↓

Employer Verification

↓

Lookup Trust Registry

↓

Institution Not Found

↓

Verification Failed

```

## Verification Process

The Verification Engine:

1. Reads the issuer identifier.
2. Searches the Trust Registry.
3. Fails to locate the issuer.
4. Stops verification immediately.

No signature verification occurs because the issuer itself is untrusted.

## Employer Portal Response

```text

❌ VERIFICATION FAILED

Issuer is not recognized by the EthioCred Trust Network.

This credential cannot be trusted.

```

## Security Property Demonstrated

✅ Authenticity

Only institutions approved through the Trust Registry may issue trusted credentials.

# 74. Attack Demonstration 3 – Revoked Credential

## Objective

Demonstrate that a valid signature alone does not guarantee a credential remains valid.

## Attack Scenario

A university issues a legitimate credential.

Later, the university revokes it due to administrative reasons such as:

- Academic misconduct
- Issuance error
- Degree withdrawal

The student still possesses the original credential.

## Attack Workflow

```text

Valid Credential

↓

Credential Revoked

↓

Student Shares Credential

↓

Employer Verification

↓

Signature Valid

↓

Revocation Registry

↓

Credential Found

↓

Verification Denied

```

## Verification Process

The Verification Engine:

1. Validates the RSA signature.
2. Confirms credential integrity.
3. Searches the Revocation Registry.
4. Rejects the credential.

## Employer Portal Response

```text

❌ ACCESS DENIED

This credential has been revoked by

Addis Ababa University.

Reason:

Academic Misconduct

Revocation Date:

2026-08-15

```

## Security Property Demonstrated

✅ Credential Validity

Digital signatures prove authenticity, while the Revocation Registry determines whether the credential remains valid.

# 75. Verification Sequence

The following diagram summarizes the complete verification process.

```text

Credential Received

↓

Credential Exists?

↓

Issuer Trusted?

↓

Institution ACTIVE?

↓

Canonicalize Data

↓

Generate SHA-256

↓

RSA Verify

↓

Revocation Check

↓

Verification Result

```

Every verification request follows this exact sequence.

# 76. Security Validation Matrix

The demonstrations collectively validate the platform's security objectives.

| Security Goal | Demonstrated By |

|--------------|-----------------|

| Integrity | Tampering Attack |

| Authenticity | Rogue Issuer Attack |

| Trust | Trust Registry |

| Non-Repudiation | RSA Digital Signatures |

| Revocation | Revocation Attack |

| Accountability | Audit Logging |

# 77. Live Demonstration Plan

During the final project defense, the demonstrations will be presented using two synchronized interfaces.

```text

Attacker Window

↓

Modify Credential

↓

Employer Portal

↓

Verification Engine

↓

Real-Time Detection

↓

Security Alert

```

The panel will observe:

- The attack being executed.
- The backend performing cryptographic verification.
- The Employer Portal rejecting the credential in real time.

This demonstrates that EthioCred detects attacks automatically without requiring manual review.

# 78. Logging Security Events

Every failed verification generates an audit record.

Example:

```json

{

  "event": "VERIFICATION_FAILED",

  "reason": "TAMPERED_CREDENTIAL",

  "credentialId": "uuid",

  "employerId": "uuid",

  "timestamp": "2026-08-20T13:45:12Z"

}

```

Possible failure reasons include:

- TAMPERED_CREDENTIAL
- UNKNOWN_ISSUER
- REVOKED_CREDENTIAL
- INVALID_SIGNATURE
- INSTITUTION_SUSPENDED
- INSTITUTION_COMPROMISED

These logs support forensic investigations and security monitoring.

# 79. Educational Value

The security demonstrations illustrate the practical application of modern cryptography within a real-world credential verification system.

They demonstrate how SHA-256 hashing, RSA digital signatures, the Trust Registry, and the Revocation Registry work together to defend against common attacks while maintaining trust between universities, students, and employers.

Rather than relying on trust alone, EthioCred provides mathematically verifiable evidence that every accepted credential is authentic, unmodified, and issued by an approved institution.

# 80. Summary

The Attack Detection Framework demonstrates the effectiveness of EthioCred's cryptographic architecture under realistic attack conditions.

By validating credential integrity, issuer authenticity, institutional trust, and credential revocation, the platform provides strong protection against forgery, impersonation, and misuse.

These demonstrations serve both as security validation and as practical evidence that the system's cryptographic design successfully defends against common attacks targeting digital academic credentials.

# 81. Future Evolution of the Cryptographic Architecture

The current EthioCred MVP uses a centralized trust architecture built around digital signatures, a Trust Registry, and secure key management.

This architecture was selected because it is practical to implement within the project's scope while remaining compatible with future distributed trust models.

Future versions of EthioCred will gradually evolve toward a decentralized credential verification infrastructure.

---

# 82. Planned Blockchain Integration

Future versions of EthioCred may integrate blockchain technology to provide immutable storage for credential metadata and verification records.

Rather than replacing the existing cryptographic system, blockchain would extend it.

The existing RSA digital signature infrastructure would remain unchanged.

Blockchain would provide:

- Immutable record keeping
- Distributed trust
- Tamper evidence
- Improved disaster recovery
- Independent verification

# 83. Proposed Hybrid Architecture

```text

University

↓

Issue Credential

↓

RSA Digital Signature

↓

Credential Database

↓

Blockchain Ledger (Future)

↓

Employer Verification

↓

Verification Engine

↓

Verification Result

```

The blockchain stores verification metadata rather than complete student records.

Sensitive personal information remains within the secure backend.

# 84. Why Not Store Entire Credentials on the Blockchain?

EthioCred intentionally avoids storing complete student records on a public blockchain.

Reasons include:

- Student privacy
- Regulatory compliance
- Large storage requirements
- Irreversible publication of personal information

Instead, only minimal verification data would be anchored on the blockchain.

Examples include:

- Credential ID
- SHA-256 hash
- Issuer ID
- Timestamp
- Transaction identifier

# 85. Distributed Trust

Today's MVP uses a centralized Trust Registry.

Future versions could synchronize trust information across multiple participating institutions.

```text

University A

↓

Blockchain Network

↑

University B

↓

Employer

↓

Independent Verification

```

Each participating organization maintains a synchronized copy of the verification ledger.

This reduces dependence on a single central server.

# 86. Tamper Detection Through Distributed Records

One advantage of blockchain is that multiple participants maintain identical copies of the verification ledger.

If an attacker modifies records stored on a single server, those changes will no longer match the copies maintained by the rest of the network.

```text

Original Record

↓

Node A

Node B

Node C

↓

Attacker Alters Node A

↓

Consensus Comparison

↓

Mismatch Detected

↓

Tampering Identified

```

This distributed architecture makes unauthorized modification significantly more difficult.

# 87. Relationship Between Blockchain and Digital Signatures

Blockchain does **not** replace digital signatures.

Instead, the two technologies complement each other.

| Digital Signatures | Blockchain |

|-------------------|------------|

| Proves who issued the credential | Protects the integrity of shared records |

| Detects credential modification | Detects ledger modification |

| Uses RSA public/private keys | Uses distributed consensus |

| Verifies individual credentials | Protects the verification infrastructure |

EthioCred will continue using RSA digital signatures even after blockchain integration.

# 88. Additional Future Improvements

Several enhancements are planned beyond blockchain integration.

These include:

- Hardware Security Module (HSM) integration
- Automated key rotation
- Certificate Transparency-style public audit logs
- Support for Ed25519 digital signatures
- Cross-university federation
- W3C Verifiable Credentials compliance
- Decentralized Identifiers (DIDs)
- Integration with the official Fayda Identity Provider
- Automated security monitoring and SIEM integration

These improvements would strengthen both security and interoperability.

# 89. Cryptographic Architecture Summary

The EthioCred cryptographic subsystem combines several complementary technologies.

```text

SHA-256

+

RSA Digital Signatures

+

AES-256-GCM

+

Trust Registry

+

Revocation Registry

+

Verification Engine

+

Audit Logging

↓

Trusted Digital Credentials

```

Each component contributes a specific security property while working together to establish authenticity, integrity, and trust.

# 90. Final Summary

Cryptography is the foundation upon which EthioCred is built.

The platform combines deterministic hashing, digital signatures, secure key management, trusted institution registration, credential revocation, and comprehensive verification into a unified security architecture.

Although the MVP uses a centralized trust model, its modular design allows future integration with blockchain-based distributed trust networks, hardware security modules, and emerging digital identity standards without requiring fundamental architectural changes.

This layered approach ensures that EthioCred remains secure, scalable, and adaptable while providing a trustworthy digital credential ecosystem for students, universities, employers, and future national identity infrastructure.