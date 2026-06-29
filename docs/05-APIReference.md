# EthioCred API Reference

**Document Version:** 1.0

# 1. Introduction

The EthioCred REST API provides secure communication between the frontend applications and the backend services.

All frontend clients communicate exclusively through this API.

The backend is responsible for:

- Authentication

- Authorization

- Credential issuance

- Verification

- Revocation

- Notification management

- Audit logging

- Institution management

The API follows RESTful principles and exchanges data in JSON format.



# 2. Frontend Clients

Three independent frontend applications consume the same API.

```text

User Wallet

        │

        │

University Portal

        │

        │

Employer Portal

        │

        ▼

REST API

        │

        ▼

Node.js Backend

        │

        ▼

PostgreSQL

```

No frontend application communicates directly with the database.



# 3. Base URL

Development

```

[http://localhost:5000/api](http://localhost:5000/api)

```

Production (Example)

```

[https://api.ethiocred.et/api](https://api.ethiocred.et/api)

```

All endpoints begin with:

```

/api

```

Example

```

GET /api/credentials

```

# 4. API Versioning

Versioning ensures backward compatibility.

Current version:

```

v1

```

Example

```

/api/v1/auth/login

```

Future versions

```

/api/v2/...

```

This allows newer clients to coexist with older ones.



# 5. Content Type

Every request and response uses JSON.

Request Header

```http

Content-Type: application/json

```

Response Header

```http

Content-Type: application/json

```

CSV uploads use:

```http

multipart/form-data

```



# 6. Authentication

Protected endpoints require a JWT access token.

Example

```http

Authorization: Bearer eyJhbGciOi...

```

Requests without a valid token receive:

```http

401 Unauthorized

```



# 7. User Roles

The API supports four user roles.

| Role | Description |

|------|-------------|

| ADMIN | System administrator |

| UNIVERSITY | University registrar |

| STUDENT | Credential holder |

| EMPLOYER | Credential verifier |

Role-Based Access Control (RBAC) ensures that users can only access endpoints relevant to their responsibilities.



# 8. HTTP Methods

| Method | Purpose |

|----------|----------|

| GET | Retrieve data |

| POST | Create resources |

| PUT | Replace resources |

| PATCH | Update resources |

| DELETE | Remove resources |

Examples

```

GET /credentials

POST /auth/login

PATCH /verification-requests/{id}

DELETE /notifications/{id}

```



# 9. Standard Response Format

All successful responses follow a consistent structure.

```json

{

  "success": true,

  "message": "Credential retrieved successfully.",

  "data": {}

}

```



## Error Response

```json

{

  "success": false,

  "message": "Credential not found.",

  "error": {

    "code": "CREDENTIAL_NOT_FOUND"

  }

}

```

A standardized response structure simplifies frontend development and error handling.



# 10. Pagination

Endpoints returning collections support pagination.

Example

```

GET /credentials?page=1&limit=20

```

Response

```json

{

  "page": 1,

  "limit": 20,

  "total": 145,

  "data": []

}

```



# 11. Filtering

Example

```

GET /credentials?status=VALID

```

```

GET /verification-logs?result=FAILED

```

```

GET /notifications?read=false

```



# 12. Sorting

Example

```

GET /credentials?sort=issued_at

```

Descending

```

GET /credentials?sort=-issued_at

```



# 13. API Security Principles

The API enforces several security measures.

- HTTPS only (production)

- JWT authentication

- Role-based authorization

- Input validation

- SQL injection protection

- Rate limiting

- Audit logging

- Secure cryptographic operations

Sensitive information is never exposed in API responses.



# 14. Backend Request Flow

Every request follows the same architecture.

```text

Client

↓

Express Route

↓

Authentication Middleware

↓

Authorization Middleware

↓

Controller

↓

Service

↓

Repository

↓

PostgreSQL

↓

Repository

↓

Service

↓

Controller

↓

JSON Response

```

This layered architecture separates routing, business logic, and data access, making the application easier to maintain and test.



# 15. Endpoint Categories

The API is organized into the following modules.

| Module | Purpose |

|----------|----------|

| Authentication | Login and token management |

| Users | User profiles |

| Institutions | Trust registry |

| Credentials | Credential issuance and retrieval |

| Verification Requests | Employer consent workflow |

| Verification | Signature validation |

| Notifications | User alerts |

| Revocation | Credential revocation |

| Audit | Security logs |

| Admin | Administrative operations |

Each module groups related endpoints together for clarity and maintainability.



# 16. Naming Conventions

Endpoints use:

- lowercase

- plural resource names

- kebab-case

Examples

```

/verification-requests

/institution-keys

/revoked-credentials

```

Avoid verbs in URLs whenever possible.

Good

```

GET /credentials

```

Bad

```

GET /getCredentials

```



# 17. Summary

The EthioCred REST API provides a secure, consistent, and scalable communication layer between the frontend applications and the backend services.

By following RESTful principles, standardized response formats, JWT-based authentication, and role-based authorization, the API enables reliable interaction with the credential management system while remaining easy to extend in future versions.

The following sections define each endpoint, including request formats, response structures, authentication requirements, and implementation details.

# 18. Authentication Module

The Authentication module manages user identity, login sessions, JWT token generation, profile retrieval, and password management.

All protected endpoints require a valid JWT access token issued by this module.



# Authentication Flow

```text

User

↓

Login Request

↓

Credential Validation

↓

JWT Generated

↓

Client Stores Token

↓

Authenticated Requests

↓

Protected Resources

```



# 19. Login

Authenticate a user and return a JWT access token.

## Endpoint

```

POST /api/v1/auth/login

```



## Authentication Required

No



## Allowed Roles

- Administrator

- University

- Student

- Employer



## Request Body

```json

{

  "email": "[abebe@example.com](mailto:abebe@example.com)",

  "password": "StrongPassword123!"

}

```



## Success Response (200 OK)

```json

{

  "success": true,

  "message": "Login successful.",

  "data": {

    "accessToken": "eyJhbGciOiJIUzI1NiIs...",

    "expiresIn": "1h",

    "user": {

      "id": "uuid",

      "fullName": "Abebe Kebede",

      "role": "STUDENT"

    }

  }

}

```



## Possible Errors

| Status | Description |

|---------|-------------|

| 400 | Invalid request body |

| 401 | Invalid email or password |

| 403 | Account suspended |

| 500 | Internal server error |



## Backend Flow

```text

Route

↓

Auth Controller

↓

Auth Service

↓

User Repository

↓

PostgreSQL

```



# 20. Logout

Invalidates the user's active session.

## Endpoint

```

POST /api/v1/auth/logout

```



## Authentication Required

Yes



## Request Header

```http

Authorization: Bearer <JWT>

```



## Success Response

```json

{

  "success": true,

  "message": "Logout successful."

}

```



## Backend Flow

```text

Route

↓

JWT Middleware

↓

Auth Controller

↓

Blacklist Token (optional)

↓

Response

```



# 21. Refresh Token

Generates a new JWT access token.

## Endpoint

```

POST /api/v1/auth/refresh

```



## Authentication Required

Yes



## Success Response

```json

{

  "success": true,

  "data": {

    "accessToken": "new-jwt-token",

    "expiresIn": "1h"

  }

}

```



# 22. Get Current User

Returns the authenticated user's profile.

## Endpoint

```

GET /api/v1/auth/me

```



## Authentication Required

Yes



## Success Response

```json

{

  "success": true,

  "data": {

    "id": "uuid",

    "fullName": "Abebe Kebede",

    "email": "[abebe@example.com](mailto:abebe@example.com)",

    "role": "STUDENT",

    "faydaId": "123456789012"

  }

}

```



## Possible Errors

| Status | Description |

|---------|-------------|

| 401 | Missing or invalid token |

| 404 | User not found |



# 23. Update Profile

Allows users to update their personal information.

## Endpoint

```

PATCH /api/v1/users/profile

```



## Authentication Required

Yes



## Request Body

```json

{

  "fullName": "Abebe Kebede",

  "email": "[abebe@example.com](mailto:abebe@example.com)"

}

```



## Success Response

```json

{

  "success": true,

  "message": "Profile updated successfully."

}

```



# 24. Change Password

Allows authenticated users to change their password.

## Endpoint

```

PATCH /api/v1/users/password

```



## Authentication Required

Yes



## Request Body

```json

{

  "currentPassword": "OldPassword123!",

  "newPassword": "NewPassword456!"

}

```



## Success Response

```json

{

  "success": true,

  "message": "Password changed successfully."

}

```



## Possible Errors

| Status | Description |

|---------|-------------|

| 400 | Validation error |

| 401 | Incorrect current password |

| 500 | Internal server error |



# 25. Authentication Security

The authentication module implements multiple security measures.

## Password Storage

Passwords are hashed using **bcrypt** before being stored in the database.

Passwords are never stored or transmitted in plaintext.



## JWT Security

JWTs include:

- User ID

- User Role

- Token Expiration

Example payload:

```json

{

  "sub": "user-uuid",

  "role": "STUDENT",

  "iat": 1753650000,

  "exp": 1753653600

}

```



## Authorization Middleware

Every protected endpoint follows this flow:

```text

Client Request

↓

JWT Validation

↓

User Lookup

↓

Role Validation

↓

Controller

↓

Business Logic

↓

Database

↓

Response

```

Unauthorized users receive:

```http

401 Unauthorized

```

Users without sufficient permissions receive:

```http

403 Forbidden

```



# 26. Authentication Endpoints Summary

| Method | Endpoint | Description | Auth Required |

|----------|--------------------------|----------------------------|---------------|

| POST | `/api/v1/auth/login` | Authenticate user | No |

| POST | `/api/v1/auth/logout` | Logout user | Yes |

| POST | `/api/v1/auth/refresh` | Refresh JWT | Yes |

| GET | `/api/v1/auth/me` | Get current user | Yes |

| PATCH | `/api/v1/users/profile` | Update profile | Yes |

| PATCH | `/api/v1/users/password` | Change password | Yes |



# 27. Summary

The Authentication module provides secure user access through JWT-based authentication and role-based authorization.

It ensures that only authenticated users can access protected resources while maintaining secure password storage, standardized responses, and consistent authorization across all EthioCred services.

Subsequent API modules build upon this authentication layer to provide functionality specific to universities, students, employers, and administrators.



# 28. University Module

The University module enables trusted institutions to issue, manage, and revoke digital academic credentials.

Only authenticated university registrars belonging to **ACTIVE** institutions may access these endpoints.

Every credential issued through these endpoints is digitally signed using the institution's RSA private key.



# University Workflow

```text

Registrar Login

↓

Upload Graduation CSV

↓

Validate Data

↓

Preview Staging Dashboard

↓

Authorize Batch

↓

Generate Digital Signatures

↓

Store Credentials

↓

Notify Students

```



# 29. Get Institution Profile

Returns information about the authenticated institution.

## Endpoint

```

GET /api/v1/institutions/me

``` 

## Authentication Required

Yes



## Allowed Roles

- UNIVERSITY



## Success Response

```json

{

  "success": true,

  "data": {

    "id": "uuid",

    "name": "Addis Ababa University",

    "status": "ACTIVE",

    "organizationFaydaId": "ORG-000123"

  }

}

```



# 30. Upload Graduation Batch

Uploads a CSV file containing graduating students.

This endpoint performs validation only.

No credentials are issued at this stage.



## Endpoint

```

POST /api/v1/credentials/batch-upload

```

---

## Authentication Required

Yes



## Allowed Roles

- UNIVERSITY



## Content Type

```

multipart/form-data

```



## Request

```text

File:

graduates.csv

```



## Expected CSV Format

```csv

fayda_id,full_name,department,graduation_date,gpa,certificate_serial

123456789012,Abebe Kebede,Software Engineering,2026-07-05,3.91,AAU-2026-0041

```



## Success Response

```json

{

  "success": true,

  "message": "CSV uploaded successfully.",

  "data": {

    "records": 120,

    "valid": 118,

    "invalid": 2

  }

}

```



## Backend Flow

```text

Route

↓

Upload Middleware

↓

CSV Parser

↓

Validation Service

↓

Temporary Staging

↓

Response

```

No cryptographic operations occur during this stage.



# 31. Preview Batch

Returns validated records stored in the staging area.

The registrar reviews all records before issuing credentials.

## Endpoint

```

GET /api/v1/credentials/staging

```



## Authentication Required

Yes



## Allowed Roles

- UNIVERSITY



## Success Response

```json

{

  "success": true,

  "data": [

    {

      "student": "Abebe Kebede",

      "department": "Software Engineering",

      "status": "VALID"

    }

  ]

}

```



# 32. Issue Credential Batch

Authorizes the batch and begins the cryptographic issuance pipeline.

This is the core operation of EthioCred.



## Endpoint

```

POST /api/v1/credentials/issue-batch

```



## Authentication Required

Yes



## Allowed Roles

- UNIVERSITY



## Backend Processing Pipeline

```text

Read Staging Records

↓

Canonicalize JSON

↓

Generate SHA-256 Hash

↓

Load Private Key

↓

Generate RSA Signature

↓

Store Credential

↓

Generate Audit Log

↓

Create Student Notification

```



## Success Response

```json

{

  "success": true,

  "message": "118 credentials successfully issued.",

  "data": {

    "issued": 118,

    "failed": 0

  }

}

```



## Possible Errors

| Status | Description |

|---------|-------------|

| 400 | Invalid staging data |

| 401 | Unauthorized |

| 403 | Institution inactive |

| 500 | Signing failure |

---

# 33. Get Issued Credentials

Returns credentials issued by the authenticated institution.



## Endpoint

```

GET /api/v1/credentials

```



## Authentication Required

Yes



## Query Parameters

```

?page=1

&limit=20

&status=VALID

```



## Success Response

```json

{

  "success": true,

  "data": [

    {

      "serialNumber": "AAU-2026-0041",

      "student": "Abebe Kebede",

      "status": "VALID"

    }

  ]

}

```



# 34. Get Credential Details

Returns detailed information for one credential.



## Endpoint

```

GET /api/v1/credentials/{credentialId}

```



## Success Response

```json

{

  "success": true,

  "data": {

    "serialNumber": "AAU-2026-0041",

    "payload": {},

    "signature": "...",

    "status": "VALID"

  }

}

```



# 35. Revoke Credential

Revokes an issued credential.

The signature remains valid, but future verification attempts will fail because the credential appears in the revocation registry.



## Endpoint

```

PATCH /api/v1/credentials/{credentialId}/revoke

```



## Authentication Required

Yes



## Allowed Roles

- UNIVERSITY



## Request Body

```json

{

  "reason": "Academic Misconduct"

}

```



## Backend Flow

```text

Credential Lookup

↓

Status Validation

↓

Insert Revocation Record

↓

Update Credential Status

↓

Create Audit Log

↓

Notify Student

```



## Success Response

```json

{

  "success": true,

  "message": "Credential revoked successfully."

}

```



# 36. View Verification Requests

Displays employer requests awaiting student approval.

Universities may use this endpoint for reporting and support purposes.



## Endpoint

```

GET /api/v1/verification-requests

```



## Authentication Required

Yes



## Allowed Roles

- UNIVERSITY



## Success Response

```json

{

  "success": true,

  "data": [

    {

      "student": "Abebe Kebede",

      "employer": "ABC Technologies",

      "status": "PENDING"

    }

  ]

}

```



# 37. Institution Reports

Returns issuance statistics for dashboards.



## Endpoint

```

GET /api/v1/reports/institution

```



## Success Response

```json

{

  "success": true,

  "data": {

    "credentialsIssued": 1250,

    "credentialsRevoked": 4,

    "successfulVerifications": 420,

    "failedVerifications": 9

  }

}

```

# 38. Security Demonstration Endpoints (Development Only)

To support live demonstrations during project presentations and security evaluations, EthioCred includes a set of development-only endpoints.

These endpoints simulate common attacks against digital credentials and demonstrate how the verification engine detects and blocks malicious activity.

> **Important:** These endpoints are disabled in production environments and are available only when the application is running in development or demonstration mode.



## 38.1 Tampering Detection Demo

Simulates a credential whose contents have been modified after it was digitally signed.

### Endpoint

```

POST /api/v1/demo/tamper-check

```

### Authentication Required

Yes

### Allowed Roles

- ADMIN

- UNIVERSITY

### Request Body

```json

{

  "credentialId": "credential-uuid",

  "modifiedPayload": {

    "gpa": 3.95

  }

}

```

### Backend Flow

```text

Retrieve Original Credential

↓

Replace Selected Fields

↓

Generate New SHA-256 Hash

↓

Decrypt Original Signature

↓

Compare Hashes

↓

Integrity Validation Failed

↓

Generate Audit Log

```

### Success Response

```json

{

  "success": true,

  "result": "TAMPERED",

  "message": "Integrity check failed. Credential data has been modified."

}

```

## 38.2 Rogue Issuer Demo

Simulates a credential issued by an organization that is not registered within the EthioCred Trust Registry.

### Endpoint

```

POST /api/v1/demo/rogue-issuer

```

### Authentication Required

Yes

### Allowed Roles

- ADMIN

### Backend Flow

```text

Load Credential

↓

Read Issuer ID

↓

Search Trust Registry

↓

Issuer Not Found

↓

Reject Verification

↓

Generate Audit Log

```

### Success Response

```json

{

  "success": true,

  "result": "UNTRUSTED_ISSUER",

  "message": "Issuer is not recognized by the EthioCred Trust Network."

}

```

## 38.3 Revocation Demo

Demonstrates that a valid cryptographic signature alone is insufficient if the credential has been revoked.

### Endpoint

```

POST /api/v1/demo/revocation-check

```

### Authentication Required

Yes

### Allowed Roles

- ADMIN

- UNIVERSITY

### Request Body

```json

{

  "credentialId": "credential-uuid"

}

```

### Backend Flow

```text

Verify Digital Signature

↓

Check Revocation Registry

↓

Credential Found

↓

Reject Verification

↓

Generate Audit Log

```

### Success Response

```json

{

  "success": true,

  "result": "REVOKED",

  "message": "Credential has been revoked by the issuing institution."

}

```

## 38.4 Demonstration Endpoints Summary

| Method | Endpoint | Purpose |

|----------|----------------------------------|-------------------------------------------|

| POST | `/api/v1/demo/tamper-check` | Demonstrate integrity verification |

| POST | `/api/v1/demo/rogue-issuer` | Demonstrate trust registry validation |

| POST | `/api/v1/demo/revocation-check` | Demonstrate revocation enforcement |

These endpoints are intended solely for demonstrations, testing, and academic presentations. They showcase the security mechanisms of the EthioCred platform and are not deployed in production environments.



# 38.5 Generate Demo Data (Development Only)

Creates a complete demonstration environment with realistic sample data.

This endpoint is intended exclusively for development, testing, and project demonstrations.

It automatically populates the database with trusted institutions, users, credentials, verification requests, and attack scenarios.

> **Important:** This endpoint is disabled in production environments.

## Endpoint

```

POST /api/v1/demo/generate-sample-data

```



## Authentication Required

Yes



## Allowed Roles

- ADMIN



## Request Body

No request body is required.

```json

{}

```



## Backend Workflow

```text

Delete Existing Demo Data

↓

Create Trusted Institutions

↓

Generate RSA Key Pairs

↓

Register Public Keys

↓

Create University Users

↓

Create Student Accounts

↓

Create Employer Accounts

↓

Issue Sample Credentials

↓

Generate Verification Requests

↓

Generate Notifications

↓

Create Audit Logs

↓

Create Revoked Credential

↓

Create Tampered Credential Copy

↓

Return Summary

```



## Generated Sample Data

| Resource | Quantity |

|-----------|----------|

| Trusted Universities | 2 |

| University Users | 4 |

| Students | 20 |

| Employers | 5 |

| Administrators | 1 |

| Credentials | 20 |

| Verification Requests | 8 |

| Notifications | 30 |

| Audit Logs | 60+ |

| Revoked Credentials | 1 |

| Tampered Credential | 1 |

| Rogue Issuer Certificate | 1 |



## Default Institutions

```

Addis Ababa University

Adama Science and Technology University

```



## Demo Student Accounts

Example

| Name | Role |

|------|------|

| Abebe Kebede | Student |

| Hana Tesfaye | Student |

| Samuel Bekele | Student |



## Demo Employer Accounts

Example

| Company | Role |

|----------|------|

| ABC Technologies | Employer |

| Ethio Software PLC | Employer |

| Addis Solutions | Employer |



## Success Response

```json

{

  "success": true,

  "message": "Demo environment successfully generated.",

  "data": {

    "institutions": 2,

    "students": 20,

    "employers": 5,

    "credentials": 20,

    "verificationRequests": 8,

    "revokedCredentials": 1,

    "tamperedCredentials": 1

  }

}

```



## Example Use Cases

This endpoint should be executed before:

- Project demonstrations

- Lecturer presentations

- Security attack demonstrations

- Automated integration tests

- User acceptance testing

It guarantees a consistent and repeatable dataset for every demonstration.



## Security Notice

The endpoint is only available when:

```

NODE_ENV=development

```

or

```

APP_MODE=demo

```

Any request made while the application is running in production returns:

```http

403 Forbidden

```

This prevents accidental overwriting of production data.

# 38. University Endpoints Summary

| Method | Endpoint | Description |

|----------|-----------------------------------------------|--------------------------------------|

| GET | `/api/v1/institutions/me` | Institution profile |

| POST | `/api/v1/credentials/batch-upload` | Upload graduation CSV |

| GET | `/api/v1/credentials/staging` | Preview validated batch |

| POST | `/api/v1/credentials/issue-batch` | Issue signed credentials |

| GET | `/api/v1/credentials` | List issued credentials |

| GET | `/api/v1/credentials/{credentialId}` | Credential details |

| PATCH | `/api/v1/credentials/{credentialId}/revoke` | Revoke credential |

| GET | `/api/v1/verification-requests` | View verification requests |

| GET | `/api/v1/reports/institution` | Institution statistics |



# 39. Summary

The University module is responsible for the secure issuance and lifecycle management of academic credentials.

Through a staged CSV upload process, registrar approval, cryptographic signing pipeline, and comprehensive audit logging, the module ensures that every credential is authentic, traceable, and verifiable. It also supports credential revocation and institutional reporting while maintaining the integrity of the EthioCred trust network.