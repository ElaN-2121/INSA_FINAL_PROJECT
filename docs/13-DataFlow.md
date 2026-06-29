# EthioCred Data Flow

**Document Version:** 1.0

# 1. Purpose

This document describes how data flows through the EthioCred platform during authentication, credential issuance, verification, and revocation. Understanding these workflows helps developers and stakeholders visualize how frontend applications, backend services, cryptographic modules, and the database interact to provide a secure digital credential system.

# 2. Overall System Data Flow

```text
                  +----------------------+
                  |  University Portal   |
                  +----------+-----------+
                             |
                  CSV Upload / API Request
                             |
                             v
                 +-------------------------+
                 |    Backend API Server   |
                 +-------------------------+
                  | Authentication (JWT)
                  | Validation
                  | Business Logic
                  | Crypto Service
                  | Repository Layer
                             |
                             v
                 +-------------------------+
                 |     PostgreSQL DB       |
                 +-------------------------+
                             |
          +------------------+------------------+
          |                                     |
          v                                     v
 +---------------------+             +----------------------+
 |   User Wallet App   |             | Employer Portal      |
 +---------------------+             +----------------------+
          |                                     |
          | View Credentials                    | Request Verification
          |                                     |
          +------------------+------------------+
                             |
                             v
                 +-------------------------+
                 | Verification Engine     |
                 +-------------------------+
                             |
                             v
                  Verification Result

```

# 3. Credential Issuance Flow

```text
Registrar Login

↓

JWT Authentication

↓

Upload Graduation CSV

↓

CSV Validation

↓

Staging Dashboard Review

↓

Authorize Batch

↓

Canonicalize Student Data

↓

Generate SHA-256 Hash

↓

Generate RSA Digital Signature

↓

Store Credential

↓

Link Credential to Holder Fayda ID

↓

Student Views Credential in Wallet

```

# 4. Credential Verification Flow

```text
Employer Login

↓

Submit Verification Request

↓

Backend Authentication

↓

Retrieve Credential

↓

Validate Trusted Institution

↓

Recalculate SHA-256 Hash

↓

Verify RSA Signature

↓

Check Revocation Status

↓

(Future) Compare Blockchain Record

↓

Return Verification Result

```

# 5. Authentication Flow

```text
User Login

↓

Credentials Verified

↓

JWT Generated

↓

JWT Returned to Frontend

↓

Protected API Requests

↓

JWT Validation

↓

Authorized Access

```

# 6. Revocation Flow

```text
Registrar Revokes Credential

↓

Credential Status Updated

↓

Revocation Logged

↓

Future Verification Request

↓

Status Checked

↓

Credential Rejected

```

# 7. Security Events

Throughout every workflow, the backend records important events such as:

- User authentication
- Credential issuance
- Verification requests
- Credential revocation
- Failed login attempts
- Invalid signature detection
- Unauthorized access attempts

These audit logs support monitoring, accountability, and future security analysis.

# 8. Future Data Flow

Future versions of EthioCred will introduce a blockchain network.

Instead of relying solely on the PostgreSQL database, credential hashes will also be anchored to a distributed ledger.

```text
Credential Issued

↓

Generate SHA-256

↓

Store in PostgreSQL

↓

Store Hash on Blockchain

↓

Future Verification

↓

Compare Database Hash

↓

Compare Blockchain Hash

↓

Credential Verified

```

This additional layer will improve tamper detection, resilience, and trust without replacing the existing cryptographic verification process.

# 9. Summary

The EthioCred data flow is designed to ensure that every credential progresses through secure, verifiable stages—from issuance and storage to verification and revocation. By combining structured API communication, cryptographic operations, database persistence, and future blockchain integration, the platform maintains the integrity, authenticity, and traceability of academic credentials throughout their lifecycle.