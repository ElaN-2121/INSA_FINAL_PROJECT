# EthioCred Backend Architecture

**Document Version:** 1.0

# 1. Introduction

The EthioCred backend is the core processing engine of the platform. It coordinates authentication, credential issuance, cryptographic operations, verification requests, database interactions, and security enforcement.

Unlike the frontend applications, which are responsible for user interaction, the backend executes the business logic that ensures every academic credential is authentic, verifiable, and securely managed.

The backend follows a layered architecture that separates concerns into controllers, services, middleware, repositories, and cryptographic utilities. This modular design improves maintainability, scalability, and security.

# 2. Objectives

The backend has several primary objectives:

- Authenticate and authorize system users.
- Manage universities and institutional trust.
- Issue digitally signed academic credentials.
- Verify credential authenticity.
- Manage credential revocation.
- Handle employer verification requests.
- Maintain audit logs for security events.
- Securely manage cryptographic keys.
- Provide RESTful APIs for all frontend applications.

These responsibilities establish the backend as the trusted core of the EthioCred ecosystem.

# 3. Technology Stack

The backend is implemented using technologies chosen for reliability, performance, and compatibility with modern web applications.

| Component | Technology |

|-----------|------------|

| Runtime Environment | Node.js |

| Web Framework | Express.js |

| Database | PostgreSQL |

| Authentication | JSON Web Tokens (JWT) |

| Password Hashing | bcrypt |

| Cryptography | Node.js Crypto Module |

| File Uploads | Multer |

| CSV Parsing | csv-parser |

| Environment Configuration | dotenv |

| Logging | Winston (or custom logger) |

This technology stack provides a balance between development simplicity and enterprise-grade functionality.

# 4. Why Node.js and Express?

Node.js was selected because it provides an event-driven, non-blocking architecture suitable for handling multiple concurrent requests efficiently.

Express.js complements Node.js by providing a lightweight and flexible framework for building RESTful APIs.

Key advantages include:

- High performance for I/O-intensive applications.
- Large ecosystem of community packages.
- Rapid API development.
- Easy integration with React applications.
- Native support for asynchronous programming.
- Excellent compatibility with cryptographic libraries.

Together, Node.js and Express enable a scalable backend architecture suitable for the EthioCred platform.

# 5. Backend Responsibilities

The backend performs all security-critical operations within the system.

These responsibilities include:

### Authentication

- User login
- JWT generation
- Session validation

### Credential Issuance

- Process uploaded graduation batches.
- Generate digital signatures.
- Store issued credentials.

### Verification

- Validate digital signatures.
- Check institution trust.
- Verify credential status.
- Return verification results.

### Security

- Encrypt sensitive keys.
- Validate permissions.
- Record audit logs.
- Enforce rate limits.

### Data Management

- Read and write PostgreSQL records.
- Maintain referential integrity.
- Support future blockchain integration.

# 6. High-Level Backend Architecture

```text

React Frontend Applications

        │

        ▼

REST API (HTTPS)

        │

        ▼

Express Server

        │

        ▼

Controllers

        │

        ▼

Services

        │

        ▼

Repositories

        │

        ▼

PostgreSQL Database

        │

        ▼

Verification Results

```

The backend acts as the intermediary between client applications and persistent storage while enforcing all security and business rules.

# 7. Request Lifecycle

Every client request follows a structured processing pipeline.

```text

Client Request

↓

Express Router

↓

Authentication Middleware

↓

Authorization Middleware

↓

Validation Middleware

↓

Controller

↓

Service Layer

↓

Repository Layer

↓

Database

↓

Controller

↓

HTTP Response

```

Each layer has a specific responsibility, ensuring that requests are processed consistently and securely.

# 8. Core Design Principles

The backend architecture follows several software engineering principles:

### Separation of Concerns

Each layer has a clearly defined responsibility.

### Modularity

Components can be developed, tested, and maintained independently.

### Security by Design

Authentication, authorization, and cryptographic validation are integrated into every critical workflow.

### Scalability

The architecture supports future expansion, including distributed services and blockchain integration.

### Maintainability

Consistent coding standards and folder organization simplify long-term development.

# 9. Interaction with Frontend Applications

The backend serves three independent React applications through a unified REST API.

```text

University Portal

↓

Backend API

↑

User Wallet

↓

Backend API

↑

Employer Portal

```

Each frontend consumes only the endpoints relevant to its functionality, while the backend enforces role-based access control to ensure users can perform only authorized actions.

# 10. Summary

The EthioCred backend is the central processing layer responsible for implementing the platform's business logic, security mechanisms, and cryptographic operations.

Its layered architecture, modular organization, and secure API design provide a reliable foundation for credential issuance, verification, authentication, and future enhancements such as blockchain integration.

The following sections examine each architectural layer in greater detail, beginning with the internal layered architecture and the responsibilities of controllers, services, middleware, repositories, and cryptographic components.

# 11. Layered Backend Architecture

EthioCred follows a layered backend architecture that separates the application into independent components with clearly defined responsibilities.

Each layer performs one specific role and communicates only with adjacent layers.

This architecture improves:

- Maintainability
- Scalability
- Testability
- Security
- Code readability

The layered approach also allows future migration toward microservices without major redesign.

# 12. Backend Layer Overview

The backend consists of the following layers:

```text

                Client Request

                      │

                      ▼

              Express Router

                      │

                      ▼

               Middleware Layer

                      │

                      ▼

              Controller Layer

                      │

                      ▼

               Service Layer

                      │

                      ▼

             Repository Layer

                      │

                      ▼

               PostgreSQL Database

```

Each request flows through every layer before a response is returned.

# 13. Express Router Layer

The Router is the application's entry point.

Responsibilities include:

- Mapping URLs to controllers.
- Grouping related endpoints.
- Applying middleware.
- Versioning APIs.
- Organizing routes.

Example:

```text

POST /api/auth/login

↓

Auth Controller

GET /api/wallet

↓

Wallet Controller

POST /api/verify

↓

Verification Controller

```

The router contains no business logic.

# 14. Middleware Layer

Middleware performs operations before requests reach controllers.

EthioCred uses several middleware components.

### Authentication Middleware

- Validate JWT
- Decode user information
- Reject expired tokens

### Authorization Middleware

- Verify user role
- Restrict protected endpoints

Example:

```text

Registrar

↓

Can Issue Credentials

Employer

↓

Cannot Issue Credentials

```

### Validation Middleware

- Validate request body
- Validate parameters
- Reject malformed requests

### Logger Middleware

- Record incoming requests
- Measure response time
- Support auditing

### Error Middleware

- Catch unexpected exceptions
- Return standardized error responses
- Prevent server crashes

# 15. Controller Layer

Controllers receive validated requests from the router.

Responsibilities include:

- Reading request parameters.
- Calling service methods.
- Returning HTTP responses.
- Handling response formatting.

Controllers do **not** contain business logic.

Example:

```text

Verification Request

↓

Verification Controller

↓

Verification Service

```

Example controllers:

- AuthController
- InstitutionController
- CredentialController
- VerificationController
- WalletController

# 16. Service Layer

The Service Layer contains the business logic of EthioCred.

This is where the platform performs:

- Credential issuance
- Verification
- Cryptographic operations
- Revocation
- Consent handling
- Audit logging

Example:

```text

Issue Credential

↓

Validate Institution

↓

Canonicalize Data

↓

Generate SHA-256

↓

RSA Sign

↓

Save Credential

```

Unlike controllers, services make decisions and coordinate multiple system components.

# 17. Repository Layer

Repositories isolate all database operations.

Responsibilities include:

- Executing SQL queries
- Reading records
- Writing records
- Updating credential status
- Retrieving verification history

Example:

```text

Credential Repository

↓

SELECT Credential

↓

PostgreSQL

```

This separation allows database logic to change without affecting the service layer.

# 18. Cryptography Layer

EthioCred separates cryptographic operations into dedicated utility modules.

Components include:

```text

hashing.js

↓

SHA-256

rsa.js

↓

Digital Signatures

aes.js

↓

Private Key Encryption

canonicalizer.js

↓

JSON Canonicalization

keyVault.js

↓

Secure Key Access

```

This isolation improves security and simplifies testing.

# 18.1 Crypto Service Layer

To centralize all cryptographic operations, EthioCred introduces a dedicated **Crypto Service** that acts as an abstraction layer between the business logic and the low-level cryptographic utilities.

Rather than allowing application services to call RSA, SHA-256, or AES modules directly, all cryptographic operations are coordinated through `crypto.service.js`.

Architecture:

```text

Credential Service

↓

Crypto Service

↓

Canonicalizer

↓

SHA-256

↓

RSA Digital Signature

↓

AES Key Vault

↓

Verification Result

```

The Crypto Service provides a single interface for cryptographic operations such as:

- Canonicalizing credential data
- Generating SHA-256 hashes
- Creating RSA digital signatures
- Verifying digital signatures
- Encrypting and decrypting private keys
- Managing secure key access

Example responsibilities:

```text

crypto.service.js

├── signCredential()

├── verifySignature()

├── hashCredential()

├── encryptPrivateKey()

├── decryptPrivateKey()

└── loadInstitutionKey()

```



### Advantages

- Centralizes cryptographic logic
- Simplifies testing and maintenance
- Reduces code duplication
- Improves separation of concerns
- Supports future cryptographic algorithms (e.g., Ed25519)
- Simplifies future blockchain integration

Application services interact only with the Crypto Service, while the Crypto Service manages the underlying cryptographic implementation.

# 19. Layer Communication Rules

Each layer communicates only with adjacent layers.

```text

Router

↓

Middleware

↓

Controller

↓

Service

↓

Repository

↓

Database

```

The following interactions are prohibited:

- Controllers directly querying the database.
- Routes containing business logic.
- Middleware modifying database records.
- Services returning HTTP responses.

These restrictions maintain a clean separation of responsibilities.

# 20. Dependency Flow

Backend dependencies always move downward.

```text

Routes

↓

Controllers

↓

Services

↓

Repositories

↓

Database

```

Lower layers never depend on higher layers.

This minimizes coupling and improves maintainability.

# 21. Advantages of the Layered Architecture

The layered architecture provides several benefits.

| Benefit | Description |

|----------|-------------|

| Maintainability | Easier to modify individual layers |

| Scalability | New services can be added without affecting existing components |

| Testability | Layers can be tested independently |

| Security | Centralized authentication and authorization |

| Reusability | Business logic reused across multiple endpoints |

| Flexibility | Easier migration to microservices |

# 22. Summary

The layered architecture forms the structural backbone of the EthioCred backend.

By separating routing, middleware, controllers, services, repositories, and cryptographic utilities into independent layers, the system achieves a modular, secure, and maintainable design.

Each request follows a predictable execution path, ensuring consistent processing while reducing complexity and supporting future expansion.

The next section examines how a client request travels through these layers, from the moment it reaches the server until a secure response is returned to the user.

# 23. API Request Lifecycle

Every request sent to the EthioCred backend follows a structured execution pipeline before a response is returned.

This ensures that every request is authenticated, validated, authorized, processed, logged, and securely handled.

The lifecycle is identical for all frontend applications, including the University Portal, User Wallet, and Employer Portal.

# 24. Complete Request Flow

```text

React Client

↓

HTTPS Request

↓

Express Router

↓

Authentication Middleware

↓

Authorization Middleware

↓

Validation Middleware

↓

Controller

↓

Service Layer

↓

Crypto Service (when required)

↓

Repository Layer

↓

PostgreSQL

↓

Controller

↓

HTTP Response

```

Each layer performs a specific task before passing control to the next layer.

# 25. Step 1 – Client Request

The process begins when a frontend application sends an HTTPS request to the backend.

Examples include:

```http

POST /api/auth/login

POST /api/credentials/issue

GET /api/wallet

POST /api/verify

POST /api/verification-requests

```

Requests contain:

- HTTP method
- Endpoint
- Headers
- JWT (if authenticated)
- Request body
- Query parameters (optional)

# 26. Step 2 – Express Router

The Express Router identifies which controller should process the request.

Example:

```text

POST /api/verify

↓

verification.routes.js

↓

VerificationController.verifyCredential()

```

The router itself performs no business logic.

# 27. Step 3 – Authentication Middleware

Protected endpoints require a valid JWT.

Authentication middleware performs the following steps:

```text

Receive JWT

↓

Validate Signature

↓

Check Expiration

↓

Extract User Information

↓

Attach User Object to Request

↓

Continue Processing

```

If authentication fails:

```http

401 Unauthorized

```

is returned immediately.

# 28. Step 4 – Authorization Middleware

After authentication, the user's role is verified.

Example:

| User Role | Allowed Operations |

|-----------|--------------------|

| Student | View Wallet, Approve Requests |

| Registrar | Issue Credentials, Revoke Credentials |

| Employer | Request Verification |

| Administrator | Manage Institutions |

Unauthorized operations return:

```http

403 Forbidden

```

# 29. Step 5 – Validation Middleware

Incoming requests are validated before business logic executes.

Validation includes:

- Required fields
- Data types
- UUID format
- Fayda ID format
- GPA range
- CSV structure
- Request size limits

Example:

```text

Missing GPA

↓

Validation Failed

↓

400 Bad Request

```

This prevents malformed data from reaching the service layer.

# 30. Step 6 – Controller Processing

Controllers receive validated requests.

Responsibilities include:

- Reading request parameters
- Calling service methods
- Formatting HTTP responses
- Returning status codes

Example:

```text

VerificationController

↓

verificationService.verifyCredential()

↓

Return JSON Response

```

Controllers remain lightweight and contain no business logic.

# 31. Step 7 – Service Processing

The Service Layer executes the business logic.

Example verification workflow:

```text

Retrieve Credential

↓

Validate Institution

↓

Call Crypto Service

↓

Check Revocation Status

↓

Generate Verification Result

```

Services coordinate multiple repositories and utilities to complete complex operations.

# 32. Step 8 – Crypto Service

When cryptographic operations are required, the Service Layer delegates them to the Crypto Service.

Example:

```text

Verification Service

↓

Crypto Service

↓

Canonicalize Credential

↓

SHA-256

↓

RSA Verification

↓

Return Result

```

This ensures all cryptographic logic remains centralized.

# 33. Step 9 – Repository Layer

Repositories communicate with PostgreSQL.

Typical operations include:

- Retrieve institution
- Retrieve credential
- Save verification request
- Update credential status
- Write audit logs

Repositories return structured data to the Service Layer without exposing SQL details.

# 34. Step 10 – Response Generation

After processing is complete, the Controller generates a standardized HTTP response.

Example success response:

```json

{

  "success": true,

  "message": "Credential verified successfully.",

  "data": {

    "status": "VALID"

  }

}

```

Example error response:

```json

{

  "success": false,

  "error": "INVALID_SIGNATURE"

}

```

Consistent response formats simplify frontend development.

# 35. Request Logging

Every API request generates an audit record.

Example log:

```text

Timestamp:

2026-08-21 14:10:43

User:

Employer

Endpoint:

/api/verify

Result:

VALID

Duration:

112 ms

```

Logs support monitoring, troubleshooting, and security investigations.

# 36. Summary

The EthioCred backend processes every request through a structured pipeline that emphasizes security, consistency, and maintainability.

By combining routing, middleware, controllers, services, the dedicated Crypto Service, repositories, and standardized responses, the platform ensures that each request is validated, securely processed, and fully auditable before a response is returned.

The next section explores the complete credential issuance pipeline, detailing how student records are transformed into digitally signed, verifiable academic credentials.

# 37. Credential Issuance Pipeline

The Credential Issuance Pipeline is the core business process of EthioCred.

Its responsibility is to transform verified student graduation records into digitally signed, verifiable academic credentials.

Unlike traditional systems that simply store student records in a database, EthioCred cryptographically signs every credential before it is issued.

This guarantees authenticity, integrity, and non-repudiation.

# 38. End-to-End Issuance Workflow

The complete issuance workflow is illustrated below.

```text

Registrar Login

↓

Upload Graduation CSV

↓

CSV Validation

↓

Preview & Staging Dashboard

↓

Authorize Batch

↓

Canonicalize Credential Data

↓

Generate SHA-256 Hash

↓

Generate RSA Digital Signature

↓

Store Credential

↓

Notify Student Wallet

↓

Credential Successfully Issued

```

Each stage contributes to ensuring that only valid, authentic credentials are issued.

# 39. Step 1 – Registrar Authentication

Only authorized university registrars are permitted to issue credentials.

Before accessing the issuance module, the registrar must:

- Authenticate using their account.
- Present a valid JWT.
- Possess the Registrar role.
- Belong to an ACTIVE institution.

The backend verifies all of these requirements before accepting any uploaded graduation data.

```text

Registrar Login

↓

JWT Validation

↓

Role Verification

↓

Institution Status Check

↓

Access Granted

```

# 40. Step 2 – Graduation Batch Upload

The registrar exports graduating students from the university's Student Information System (SIS) as a standardized CSV file.

Example:

```csv

fayda_id,full_name,department,graduation_date,gpa,certificate_serial

123456789012,

Elnathan Nigussie,

Software Engineering,

2026-07-05,

3.91,

AAU-2026-0041

```

The CSV is uploaded through the University Portal using a secure HTTPS connection.

The backend receives the file using Multer before passing it to the CSV parser.

# 41. Step 3 – CSV Validation

Every uploaded record is validated before entering the issuance pipeline.

Validation includes:

- Required columns
- Missing values
- Duplicate certificate serial numbers
- Duplicate Fayda IDs
- GPA range validation
- Graduation date validation
- Department format
- CSV structure validation

Example:

```text

CSV Upload

↓

Validation

↓

Valid?

↓

YES → Continue

NO → Reject Upload

```

Only valid records proceed to the next stage.

# 42. Step 4 – Staging Dashboard

Before issuing credentials, the registrar reviews the uploaded data through a staging dashboard.

The dashboard highlights:

- Invalid rows
- Duplicate records
- Missing values
- Formatting issues

Possible actions include:

- Remove row
- Edit row
- Re-upload file
- Continue with valid records

This manual review step helps prevent accidental issuance.

# 43. Step 5 – Credential Canonicalization

After authorization, each student record is converted into a standardized JSON structure.

Example:

```json

{

  "issuerId": "AAU-001",

  "holderFaydaId": "123456789012",

  "studentName": "Elnathan Nigussie",

  "department": "Software Engineering",

  "gpa": 3.91,

  "graduationDate": "2026-07-05",

  "certificateSerial": "AAU-2026-0041"

}

```

Canonicalization ensures that identical credential data always produces the same cryptographic hash.

# 44. Step 6 – Hash Generation

The canonical credential is passed to the Crypto Service.

The Crypto Service generates a SHA-256 digest.

```text

Canonical JSON

↓

SHA-256

↓

Message Digest

```

The resulting hash uniquely represents the credential contents.

Any modification to the credential changes the hash completely.

# 45. Step 7 – RSA Digital Signature

The backend retrieves the university's encrypted private key from the secure software vault.

The key is decrypted only in memory.

The SHA-256 digest is signed using RSA.

```text

SHA-256 Digest

↓

University Private Key

↓

RSA Sign

↓

Digital Signature

```

The resulting digital signature is attached to the credential.

The private key is never stored in plaintext within the database or application logs.

# 46. Step 8 – Credential Packaging

After signing, the backend creates a complete verifiable credential object.

Example:

```json

{

  "credential": {

    "issuerId": "AAU-001",

    "holderFaydaId": "123456789012",

    "studentName": "Elnathan Nigussie",

    "department": "Software Engineering",

    "gpa": 3.91,

    "graduationDate": "2026-07-05",

    "certificateSerial": "AAU-2026-0041"

  },

  "digitalSignature": "<RSA Signature>",

  "status": "VALID",

  "issuedAt": "2026-07-05T10:15:00Z"

}

```

This object becomes the official digital credential stored by the system.

# 47. Step 9 – Database Storage

The Repository Layer stores the credential inside PostgreSQL.

The following information is saved:

- Credential data
- Digital signature
- Issuer ID
- Holder Fayda ID
- Issue timestamp
- Credential status
- Certificate serial number

An audit log is also created to record the issuance event.

# 48. Step 10 – Wallet Notification

Once storage is complete, the backend links the credential to the student's Fayda ID.

The next time the student logs into the User Wallet, the backend retrieves all credentials associated with their authenticated Fayda ID.

```text

Credential Stored

↓

Holder Fayda ID

↓

Wallet Lookup

↓

Student Views Credential

```

No credential is sent via email or external messaging systems.

Access is controlled entirely through authenticated wallet sessions.

# 49. Issuance Sequence Diagram

```text

Registrar

↓

University Portal

↓

Backend API

↓

CSV Parser

↓

Validation

↓

Crypto Service

↓

Repository

↓

PostgreSQL

↓

Audit Logger

↓

Student Wallet

```

This sequence illustrates how multiple backend components collaborate to issue a single academic credential securely.

# 50. Summary

The Credential Issuance Pipeline represents the foundation of the EthioCred platform.

Through rigorous validation, standardized data processing, SHA-256 hashing, RSA digital signatures, secure key management, and controlled database storage, the backend transforms ordinary graduation records into trusted digital credentials.

This process ensures that every issued credential can later be authenticated, verified, audited, and protected against tampering.

The next section describes the Verification Engine, which validates these credentials whenever an employer or authorized party requests proof of authenticity.

## 51. Verification Engine

The Verification Engine is responsible for determining whether an academic credential is authentic, trustworthy, and currently valid.

Whenever an employer, government agency, or other authorized verifier requests credential verification, the backend executes a series of security checks before returning a final result.

Unlike simple database lookups, the Verification Engine performs multiple independent validations to ensure the credential has not been forged, altered, or revoked.

# 52. Verification Workflow

Every verification request follows the same processing pipeline.

```text

Employer Requests Verification

↓

Authenticate Employer

↓

Retrieve Credential

↓

Validate Issuer

↓

Canonicalize Credential

↓

Generate SHA-256 Hash

↓

Verify RSA Signature

↓

Check Revocation Status

↓

Future Blockchain Verification

↓

Return Verification Result

```

Each step contributes to the overall trustworthiness of the verification process.

# 53. Step 1 – Employer Authentication

Only authenticated employers are permitted to verify credentials.

The backend verifies:

- Valid JWT

- Employer role

- Active employer account

- Request permissions

Example:

```text

Employer Login

↓

JWT Validation

↓

Employer Role Check

↓

Access Granted

```

Unauthorized requests are rejected immediately.

# 54. Step 2 – Credential Retrieval

The backend locates the requested credential using one or more identifiers.

Supported lookup methods include:

- Credential UUID

- Certificate Serial Number

- QR Code Identifier

- Holder Fayda ID (with consent)

The Repository Layer retrieves:

- Credential data

- Digital signature

- Issuer ID

- Credential status

- Issue timestamp

# 55. Step 3 – Trust Registry Validation

Before verifying the signature, the backend confirms that the issuing institution is trusted.

Validation includes:

- Institution exists

- Institution status is ACTIVE

- Registered public key is available

Example:

```text

Issuer ID

↓

Trust Registry

↓

Institution Found?

↓

YES → Continue

NO → Verification Failed

```

If the issuer is unknown or revoked, verification stops immediately.

# 56. Step 4 – Canonicalization & Hash Generation

The credential data is converted into a standardized format before hashing.

Example:

```text

Credential Data

↓

Canonical JSON

↓

SHA-256

↓

Message Digest

```

The generated digest represents the current state of the credential.

Even a one-character modification results in a completely different hash.

# 57. Step 5 – RSA Signature Verification

The Verification Engine retrieves the issuing institution's public key from the Trust Registry.

The backend then verifies the stored digital signature.

```text

Credential Digest

+

Institution Public Key

↓

RSA Verify

↓

Signature Valid?

```

Possible outcomes:

- Signature Valid

- Signature Invalid

Only valid signatures proceed to the next verification stage.

# 58. Step 6 – Revocation Check

A valid digital signature alone is not sufficient.

The Verification Engine also checks whether the credential has been revoked.

Possible credential statuses include:

- VALID

- REVOKED

Verification flow:

```text

Signature Valid

↓

Credential Status

↓

VALID?

↓

YES → Continue

NO → Reject Credential

```

This prevents revoked credentials from being accepted.

# 59. Step 7 – Future Blockchain Verification

Future versions of EthioCred will strengthen verification by checking the blockchain ledger.

The process will include:

```text

Retrieve Blockchain Record

↓

Compare Stored Hash

↓

Blockchain Match?

↓

YES → Continue

NO → Verification Failed

```

Blockchain verification will provide an additional layer of integrity without replacing RSA digital signatures.

# 60. Final Verification Decision

The Verification Engine combines all previous checks before making a decision.

```text

Trusted Institution

+

Valid RSA Signature

+

Credential Not Revoked

+

Blockchain Match (Future)

↓

Credential Accepted

```

If any validation fails, the credential is rejected.

# 61. Verification Responses

Example successful response:

```json

{

  "status": "VALID",

  "issuer": "Addis Ababa University",

  "issuedAt": "2026-07-05",

  "verificationTime": "2026-08-21T10:30:00Z"

}

```

Example failed response:

```json

{

  "status": "INVALID",

  "reason": "Digital signature verification failed."

}

```

Responses are standardized to simplify frontend integration.

# 62. Security Attack Detection

The Verification Engine is specifically designed to detect common attacks.

### Certificate Tampering

Changing any credential field modifies the SHA-256 hash.

Result:

```text

Integrity Check Failed

```

### Rogue Issuer

Unknown institutions are rejected because their public keys do not exist in the Trust Registry.

Result:

```text

Issuer Not Recognized

```

### Revoked Credential

Previously valid credentials are rejected if they appear in the Revocation Registry.

Result:

```text

Credential Revoked

```

These mechanisms correspond directly to the security demonstrations planned for the project defense.



# 63. Verification Sequence Diagram

```text

Employer Portal

↓

Backend API

↓

Verification Controller

↓

Verification Service

↓

Crypto Service

↓

Trust Registry

↓

Repository Layer

↓

PostgreSQL

↓

Verification Result

```

The Verification Engine coordinates multiple backend components to produce a trustworthy verification outcome.

# 64. Summary

The Verification Engine is responsible for establishing trust in every credential presented through the EthioCred platform.

By validating the issuing institution, recalculating cryptographic hashes, verifying RSA digital signatures, checking credential revocation status, and preparing for future blockchain verification, the backend ensures that only authentic and trustworthy academic credentials are accepted.

This layered verification approach provides strong protection against forgery, unauthorized issuers, credential tampering, and misuse of revoked certificates while supporting future enhancements through distributed trust technologies.

# 65. Security Architecture

Security is a foundational design principle of the EthioCred backend.

Rather than relying on a single security mechanism, the platform implements multiple layers of protection that work together to safeguard academic credentials, user identities, cryptographic keys, and backend services.

This defense-in-depth approach ensures that compromising one security layer does not compromise the entire system.

# 66. Defense-in-Depth Model

The backend protects every request using multiple independent security layers.

```text

Internet

↓

HTTPS (TLS)

↓

Express Server

↓

Rate Limiting

↓

Authentication

↓

Authorization

↓

Input Validation

↓

Business Logic

↓

Cryptographic Verification

↓

Database

↓

Audit Logging

```

Each layer blocks a different category of attacks.

# 67. Authentication Security

Authentication is based on JSON Web Tokens (JWT).

After successful login, the backend generates a signed JWT containing:

- User ID

- Fayda ID

- User Role

- Institution ID (if applicable)

- Token Expiration

Example payload:

```json

{

  "userId": "UUID",

  "role": "REGISTRAR",

  "institutionId": "AAU-001",

  "exp": 1784629200

}

```

Every protected request must include a valid JWT.

Expired or invalid tokens are rejected with:

```http

401 Unauthorized

```

# 68. Authorization & Role-Based Access Control (RBAC)

After authentication, the backend verifies that the user has permission to perform the requested action.

Supported roles include:

| Role | Permissions |

|------|-------------|

| Student | View wallet, approve or deny verification requests |

| Registrar | Issue and revoke credentials |

| Employer | Request and view verification results |

| Administrator | Manage institutions and trust registry |

Authorization checks are performed before any business logic is executed.

Unauthorized requests return:

```http

403 Forbidden

```

# 69. Cryptographic Key Security

University private keys are among the most sensitive assets in the system.

To protect them:

- Private keys are never stored in the database.

- Keys are encrypted using AES-256-GCM before storage.

- Encrypted keys are stored in environment variables or a secure software vault.

- Keys are decrypted only in memory during signing.

- Plaintext keys are never written to logs or temporary files.

```text

Encrypted Private Key

↓

AES-256-GCM Decryption

↓

Memory

↓

RSA Signing

↓

Memory Cleared

```

This minimizes the exposure of cryptographic material.

# 70. Secure Communication

All communication between frontend applications and the backend occurs over HTTPS.

Benefits include:

- Encryption of transmitted data

- Protection against eavesdropping

- Prevention of man-in-the-middle attacks

- Integrity of API requests and responses

Sensitive information such as JWTs and credential data is never transmitted over unsecured connections.

# 71. Input Validation & Sanitization

Every incoming request is validated before processing.

Validation includes:

- Required fields

- Data type checks

- Length restrictions

- Fayda ID format validation

- UUID validation

- GPA range validation

- CSV schema validation

Malformed or unexpected input is rejected immediately to reduce the risk of injection attacks and application errors.

# 72. Audit Logging

Security-related events are recorded in immutable audit logs.

Examples include:

- User login

- Failed login attempts

- Credential issuance

- Credential revocation

- Verification requests

- Institution registration

- Administrative actions

Example log entry:

```text

Timestamp:

2026-08-21 14:25:16

User:

Registrar

Action:

Issued Credential

Credential:

AAU-2026-0041

Status:

Success

```

Audit logs support accountability, monitoring, and forensic investigations.

# 73. Protection Against Common Attacks

The backend is designed to defend against several common attack vectors.

| Attack | Mitigation |

|---------|------------|

| Credential Tampering | SHA-256 hashing and RSA signature verification |

| Rogue Issuer | Trust Registry validation |

| Revoked Credential Reuse | Revocation Registry check |

| JWT Forgery | Signed JWT validation |

| SQL Injection | Parameterized queries |

| Brute Force Login | Rate limiting and account lockout (future) |

| Cross-Origin Abuse | CORS configuration |

| Sensitive Data Exposure | HTTPS and encrypted key storage |

These controls work together to provide comprehensive protection.

# 74. Security Headers & Middleware

The Express server applies additional middleware to strengthen security.

Examples include:

- **Helmet** for secure HTTP headers

- **CORS** to restrict allowed origins

- **Rate Limiter** to reduce abuse

- **Compression** to optimize responses

- **Request Logger** for monitoring

These middleware components improve resilience without affecting application functionality.

# 75. Future Security Enhancements

As EthioCred evolves, additional security mechanisms may be introduced.

Planned improvements include:

- Multi-Factor Authentication (MFA) for registrars and administrators

- Hardware Security Modules (HSMs) for private key storage

- Automated key rotation

- Intrusion Detection Systems (IDS)

- AI-assisted anomaly detection

- Blockchain-backed audit logs

- Security Information and Event Management (SIEM) integration

These enhancements will further strengthen the platform as it scales.

# 76. Summary

The EthioCred backend follows a defense-in-depth security model that combines authentication, authorization, secure communication, cryptographic protection, input validation, audit logging, and secure key management.

Rather than relying on a single security mechanism, the platform layers multiple controls to protect against credential forgery, unauthorized access, data tampering, and other common threats.

This architecture provides a secure foundation for issuing and verifying academic credentials while supporting future enhancements such as hardware-backed key management, blockchain integration, and advanced threat detection.

# 77. Scalability

The EthioCred backend has been designed using a modular architecture that allows the system to grow without requiring significant structural changes.

As additional universities, employers, and users join the platform, the backend can scale by deploying multiple API instances behind a load balancer while maintaining a shared PostgreSQL database.

Future scalability improvements include:

- Horizontal scaling of backend servers

- Database replication

- Read replicas for verification requests

- Redis caching for frequently accessed data

- Background job processing for batch credential issuance

- Containerization using Docker

- Cloud deployment using Kubernetes

# 78. Monitoring & Logging

To maintain system reliability and security, the backend records operational and security events throughout the platform.

Examples include:

- User authentication events

- Credential issuance

- Verification requests

- Revocation actions

- Failed login attempts

- System errors

Future versions may integrate centralized monitoring solutions such as ELK Stack, Prometheus, and Grafana to provide real-time dashboards, alerting, and performance metrics.

# 79. Error Handling

The backend implements centralized error handling to ensure consistent API responses and simplify debugging.

Common HTTP responses include:

| Status Code | Meaning |

|-------------|---------|

| 200 | Successful request |

| 201 | Resource created |

| 400 | Invalid request |

| 401 | Authentication failed |

| 403 | Authorization denied |

| 404 | Resource not found |

| 409 | Duplicate resource |

| 500 | Internal server error |

All unexpected exceptions are captured by a global error handler, preventing application crashes and protecting sensitive internal information from being exposed.

# 80. Future Evolution

The backend architecture has been designed to support future enhancements without major redesign.

Planned improvements include:

- Hyperledger Fabric integration

- Hardware Security Modules (HSMs) for private key protection

- Automated key rotation

- Multi-Factor Authentication (MFA)

- Redis caching

- Message queues (RabbitMQ/Kafka)

- AI-assisted fraud detection

- Microservice decomposition

- W3C Verifiable Credentials (VC)

- Decentralized Identifiers (DID)

These enhancements will strengthen security, improve scalability, and enable nationwide deployment.

# 81. Summary

The EthioCred backend follows a secure, modular, and scalable architecture centered around layered design principles.

Through RESTful APIs, cryptographic services, secure authentication, structured data management, and comprehensive verification workflows, the backend provides a reliable foundation for issuing and validating digital academic credentials.

Its modular organization enables future adoption of distributed technologies such as blockchain while preserving compatibility with the current centralized implementation, ensuring that EthioCred can evolve into a national academic credential verification platform.