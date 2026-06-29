# EthioCred Authentication & Authorization

**Document Version:** 1.0

# 1. Introduction

Authentication and authorization form the security foundation of the EthioCred platform.

Authentication answers the question:

> **"Who is the user?"**

Authorization answers the question:

> **"What is the user allowed to do?"**

Every request made to the EthioCred backend passes through these two security layers before accessing protected resources.

The authentication system ensures that:

- Only legitimate users can access the platform.

- Every request is associated with an authenticated identity.

- Users can access only resources permitted by their role.

- Every sensitive action is recorded for auditing.



# 2. Authentication Objectives

The authentication subsystem has five primary objectives.

## Identity Verification

Ensure every user has a verified identity before accessing protected resources.

## Secure Session Management

Provide secure, stateless sessions using JSON Web Tokens (JWT).

## Role-Based Access Control

Restrict access to platform features based on user roles.

## Accountability

Record authentication events and security-sensitive actions in the audit log.

## Future Fayda Integration

Support migration from local authentication to Ethiopia's national Fayda identity system without requiring changes to the rest of the application.



# 3. Authentication Architecture

EthioCred follows a centralized authentication model.

```text

                 User

                   │

                   ▼

          Login Request

                   │

                   ▼

          Authentication API

                   │

         Validate Credentials

                   │

                   ▼

            Generate JWT

                   │

                   ▼

         Return Access Token

                   │

                   ▼

     Protected API Requests

                   │

                   ▼

      Authentication Middleware

                   │

                   ▼

      Authorization Middleware

                   │

                   ▼

          Business Logic

```

All frontend applications rely on this shared authentication service.



# 4. Authentication Flow

The authentication process consists of the following steps.

```text

User Login

↓

Email & Password Submitted

↓

Credentials Validated

↓

Password Verified

↓

JWT Generated

↓

Token Returned

↓

Frontend Stores Token

↓

Authenticated API Requests

↓

JWT Validation

↓

Role Validation

↓

Access Granted

```

This process is repeated whenever a user logs in or refreshes an expired access token.



# 5. Supported User Roles

EthioCred supports four user roles.

| Role | Description |

|------|-------------|

| ADMIN | System administrators responsible for platform management and trust registry approval |

| UNIVERSITY | University registrars authorized to issue and revoke credentials |

| STUDENT | Credential holders who manage consent for verification requests |

| EMPLOYER | Organizations requesting and verifying academic credentials |

Each role has a unique set of permissions enforced by the authorization layer.



# 6. Authentication Components

The authentication subsystem consists of several cooperating components.

| Component | Responsibility |

|-----------|----------------|

| Login API | Authenticates user credentials |

| JWT Service | Generates and validates access tokens |

| Password Service | Hashes and verifies passwords |

| Authentication Middleware | Validates incoming JWTs |

| Authorization Middleware | Checks user permissions |

| Audit Logger | Records authentication events |

| User Repository | Retrieves user information from PostgreSQL |

These components work together to ensure secure and consistent access control across the platform.



# 7. Session Management

EthioCred uses stateless authentication based on JSON Web Tokens (JWT).

Unlike traditional server-side sessions, JWT authentication does not require session data to be stored in server memory.

Each authenticated request includes a signed access token that contains the user's identity and role.

Benefits include:

- Improved scalability

- Reduced server memory usage

- Simplified horizontal scaling

- Fast authentication verification



# 8. MVP Authentication Strategy

The current MVP uses local authentication with verified Fayda identifiers.

```text

User

↓

Email + Password

↓

Backend Authentication

↓

JWT Generated

↓

Backend Confirms Stored Fayda ID

↓

Access Granted

```

This allows the platform to operate independently while preserving compatibility with future national identity integration.



# 9. Future Fayda Integration

In a production deployment, authentication will be delegated to the official Fayda Identity Provider.

The expected authentication flow is:

```text

User

↓

EthioCred

↓

Redirect to Fayda Login

↓

Fayda Identity Verification

↓

OAuth2/OpenID Connect

↓

EthioCred Receives Identity Token

↓

Generate Internal JWT

↓

Authenticated Session

```

Under this architecture:

- Fayda manages identity verification.

- EthioCred manages authorization.

- User permissions remain unchanged.

- Existing backend services require minimal modification.

This design separates identity management from application-specific authorization, making the platform easier to maintain and integrate with national digital identity infrastructure.



# 10. Security Principles

The authentication subsystem follows several security principles.

### Least Privilege

Users receive only the permissions necessary to perform their responsibilities.

### Defense in Depth

Authentication is enforced through multiple layers:

- Password verification

- JWT validation

- Role validation

- Request validation

- Audit logging

### Separation of Responsibilities

Authentication determines identity.

Authorization determines permissions.

Business logic is implemented independently of authentication.

### Zero Trust

Every protected request must be authenticated and authorized, regardless of its origin.

No request is trusted implicitly.



# 11. Authentication Lifecycle

The complete authentication lifecycle is illustrated below.

```text

Account Created

↓

Password Hashed

↓

User Login

↓

Credentials Verified

↓

JWT Issued

↓

Protected API Access

↓

Token Expiration

↓

Refresh Token

↓

Logout

↓

Session Terminated

```

Every stage of this lifecycle is logged for security monitoring and auditing purposes.



# 12. Summary

The authentication subsystem provides the foundation for secure access to the EthioCred platform.

By combining password hashing, JWT-based authentication, role-based authorization, audit logging, and a future-ready Fayda integration strategy, the system ensures that only authorized users can access protected resources while remaining scalable, maintainable, and compatible with future national identity infrastructure.

The following sections describe the implementation details of password security, token generation, authorization policies, and identity verification.

# 13. Login Process

The login process is the entry point to the EthioCred platform.

Users authenticate using their registered email address and password. After successful authentication, the backend generates a signed JSON Web Token (JWT), which is used to authorize subsequent requests.

# Login Sequence

```text

User

↓

Enter Email & Password

↓

POST /api/v1/auth/login

↓

Validate Request

↓

Retrieve User Record

↓

Verify Password (bcrypt)

↓

Generate JWT

↓

Return Access Token

↓

Frontend Stores Token

↓

Authenticated Requests

```



# 14. Login Request

## Endpoint

```

POST /api/v1/auth/login

```

## Request Body

```json

{

  "email": "[abebe@example.com](mailto:abebe@example.com)",

  "password": "StrongPassword123!"

}

```

## Successful Response

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

# 15. Login Validation

Before authentication, the backend validates the incoming request.

Validation includes:

- Required fields

- Email format

- Password length

- Request body structure

Example validation rules:

| Field | Validation |

|--------|------------|

| Email | Valid email format |

| Password | Minimum 8 characters |

| Request Body | Must be valid JSON |

Invalid requests immediately return:

```http

400 Bad Request

```


# 16. Password Security

Passwords are never stored in plaintext.

Before being saved to the database, passwords are hashed using **bcrypt**.

Example:

```text

Password

↓

bcrypt Hash

↓

Database

```

Example hash:

```

$2b$12$vD4mWnL...

```

The original password cannot be recovered from the hash.



# 17. Password Verification

During login, the submitted password is compared against the stored bcrypt hash.

The comparison process is:

```text

Submitted Password

↓

[bcrypt.compare](http://bcrypt.compare)()

↓

Stored Password Hash

↓

Match?

↓

Yes → Continue Login

No → Reject Authentication

```

No plaintext passwords are ever stored or logged.



# 18. JSON Web Tokens (JWT)

After successful authentication, the backend generates a signed JSON Web Token.

The JWT contains essential information about the authenticated user.

Example payload:

```json

{

  "sub": "user-uuid",

  "role": "STUDENT",

  "email": "[abebe@example.com](mailto:abebe@example.com)",

  "iat": 1785237600,

  "exp": 1785241200

}

```

The token is digitally signed using the backend's secret key, preventing unauthorized modification.



# 19. JWT Structure

A JWT consists of three sections:

```text

Header

.

Payload

.

Signature

```

Example:

```

xxxxx.yyyyy.zzzzz

```



## Header

Contains metadata about the token.

```json

{

  "alg": "HS256",

  "typ": "JWT"

}

```

## Payload

Contains user identity and claims.

Example claims:

- User ID

- User role

- Email

- Issued time

- Expiration time

## Signature

The signature is generated using the server's secret key.

It protects the token from tampering.

If the payload changes, the signature becomes invalid and the token is rejected.



# 20. JWT Expiration

Access tokens are intentionally short-lived to reduce security risks.

Recommended lifetime:

| Token | Expiration |

|--------|------------|

| Access Token | 1 Hour |

| Refresh Token | 7 Days (Future Enhancement) |

Expired tokens cannot access protected resources.



# 21. Token Storage

The frontend stores the JWT securely after login.

Recommended approach:

- Store the access token in memory or secure HTTP-only cookies (production).

- Avoid persistent browser storage for sensitive environments.

- Remove the token immediately after logout.

Every protected request includes:

```http

Authorization: Bearer <JWT>

```



# 22. Refresh Tokens (Future Enhancement)

To improve user experience, future versions of EthioCred may support refresh tokens.

Authentication flow:

```text

Access Token Expires

↓

Client Sends Refresh Token

↓

Server Validates Refresh Token

↓

Generate New Access Token

↓

Return New JWT

```

Refresh tokens reduce the need for frequent logins while maintaining security.



# 23. Logout Process

When a user logs out:

```text

Logout Request

↓

Invalidate Session (Optional Token Blacklist)

↓

Remove Token from Client

↓

Session Ends

```

After logout:

- Protected endpoints reject the old token.

- The client must authenticate again.



# 24. Authentication Error Handling

Common authentication errors include:

| Status Code | Description |

|-------------|-------------|

| 400 | Invalid request format |

| 401 | Invalid email or password |

| 401 | Missing or invalid JWT |

| 403 | Account suspended or insufficient permissions |

| 500 | Internal server error |

The API returns standardized error responses.

Example:

```json

{

  "success": false,

  "message": "Invalid email or password.",

  "error": {

    "code": "AUTHENTICATION_FAILED"

  }

}

```



# 25. Authentication Sequence Diagram

```text

User

↓

Login Request

↓

Validation

↓

Find User

↓

Verify Password

↓

Generate JWT

↓

Return Token

↓

Store Token

↓

Protected Request

↓

JWT Verification

↓

Access Granted

```



# 26. Summary

The login process securely authenticates users using bcrypt password hashing and JWT-based session management.

By validating user credentials, issuing signed access tokens, enforcing token expiration, and following secure storage practices, the authentication subsystem provides a reliable and scalable foundation for protecting EthioCred's resources while preparing the platform for future enhancements such as refresh tokens and external identity providers.



# 27. Role-Based Access Control (RBAC)

After a user has been authenticated, EthioCred determines what resources that user is permitted to access.

This process is known as **Authorization**.

EthioCred implements **Role-Based Access Control (RBAC)**, where permissions are assigned to roles rather than individual users.

This simplifies user management while ensuring that users only have access to resources required for their responsibilities.



# 28. Authorization Architecture

Every protected request passes through an authorization layer before reaching the application's business logic.

```text

Client Request

↓

JWT Authentication Middleware

↓

Extract User Role

↓

Authorization Middleware

↓

Permission Check

↓

Controller

↓

Business Logic

↓

Database

```

If the user lacks the required permissions, the request is rejected before any database operations occur.



# 29. Supported Roles

EthioCred defines four primary roles.

| Role | Description |

|------|-------------|

| ADMIN | Manages the platform, approves institutions, manages trust registry, monitors security |

| UNIVERSITY | Issues, manages, and revokes academic credentials |

| STUDENT | Manages personal credentials and approves employer verification requests |

| EMPLOYER | Requests verification and verifies academic credentials |

Every authenticated user belongs to exactly one role.



# 30. Permission Matrix

The following matrix defines which actions are permitted for each role.

| Feature | Admin | University | Student | Employer |

|----------|:-----:|:----------:|:-------:|:--------:|

| Login | ✅ | ✅ | ✅ | ✅ |

| View Profile | ✅ | ✅ | ✅ | ✅ |

| Update Profile | ✅ | ✅ | ✅ | ✅ |

| Register Institution | ✅ | ❌ | ❌ | ❌ |

| Approve Institution | ✅ | ❌ | ❌ | ❌ |

| Suspend Institution | ✅ | ❌ | ❌ | ❌ |

| Manage Trust Registry | ✅ | ❌ | ❌ | ❌ |

| Upload Graduation CSV | ❌ | ✅ | ❌ | ❌ |

| Preview Batch | ❌ | ✅ | ❌ | ❌ |

| Issue Credentials | ❌ | ✅ | ❌ | ❌ |

| Revoke Credential | ❌ | ✅ | ❌ | ❌ |

| View Institution Reports | ❌ | ✅ | ❌ | ❌ |

| View Wallet | ❌ | ❌ | ✅ | ❌ |

| Approve Verification Request | ❌ | ❌ | ✅ | ❌ |

| Deny Verification Request | ❌ | ❌ | ✅ | ❌ |

| View Notifications | ❌ | ❌ | ✅ | ❌ |

| Request Verification | ❌ | ❌ | ❌ | ✅ |

| Verify Credential | ❌ | ❌ | ❌ | ✅ |

| View Verification History | ❌ | ❌ | ❌ | ✅ |

| View Audit Logs | ✅ | ❌ | ❌ | ❌ |

| Generate Demo Data | ✅ | ❌ | ❌ | ❌ |

| Run Security Demonstrations | ✅ | ✅ | ❌ | ❌ |



# 31. Authorization Middleware

Authorization is implemented through middleware that executes after JWT authentication.

The middleware performs the following steps:

```text

Read JWT

↓

Validate Signature

↓

Extract User Role

↓

Compare Against Required Roles

↓

Authorized?

↓

Yes → Continue

No → Return 403 Forbidden

```

Only requests that pass all authorization checks are forwarded to the controller.



# 32. Route Protection

Each protected endpoint declares the roles that are allowed to access it.

Example:

```javascript

[router.post](http://router.post)(

  "/credentials/issue-batch",

  authenticate,

  authorize(["UNIVERSITY"]),

  issueBatchController

);

```

Another example:

```javascript

[router.post](http://router.post)(

  "/institutions/approve",

  authenticate,

  authorize(["ADMIN"]),

  approveInstitutionController

);

```

This approach keeps authorization logic centralized and easy to maintain.



# 33. Authorization Decision Flow

The following sequence illustrates how authorization decisions are made.

```text

Incoming Request

↓

Authentication Middleware

↓

JWT Valid?

↓

No

↓

401 Unauthorized

↓

Yes

↓

Authorization Middleware

↓

Role Allowed?

↓

No

↓

403 Forbidden

↓

Yes

↓

Controller

↓

Business Logic

↓

Response

```



# 34. Principle of Least Privilege

EthioCred follows the **Principle of Least Privilege (PoLP)**.

Every user receives only the permissions required to perform their assigned responsibilities.

Examples:

- Employers cannot issue credentials.

- Students cannot revoke credentials.

- Universities cannot approve new institutions.

- Administrators cannot approve verification requests on behalf of students.

This minimizes the impact of compromised accounts and reduces the system's attack surface.



# 35. Ownership-Based Authorization

In addition to role-based permissions, EthioCred enforces ownership checks.

Examples include:

### Student Wallet

A student may only view credentials associated with their own Fayda ID.

```text

Authenticated Fayda ID

↓

Lookup Credentials

↓

holder_fayda_id matches?

↓

Yes → Return Credentials

No → 403 Forbidden

```

### Employer Verification

An employer may only access verification requests that they initiated and that have been approved by the student.

### University Access

A university may only manage credentials issued by that institution.



# 36. Administrative Privileges

System administrators have additional responsibilities beyond standard users.

Administrator permissions include:

- Approving institutions

- Suspending institutions

- Revoking institution trust

- Managing the Trust Registry

- Viewing audit logs

- Managing system configuration

- Running demonstration endpoints

- Generating demo datasets

Administrative actions are recorded in the audit log to ensure accountability.



# 37. Authorization Error Responses

When authorization fails, the API returns standardized responses.

Unauthorized request:

```http

401 Unauthorized

```

Example:

```json

{

  "success": false,

  "message": "Authentication required."

}

```



Forbidden request:

```http

403 Forbidden

```

Example:

```json

{

  "success": false,

  "message": "You do not have permission to perform this action."

}

```



# 38. Security Benefits of RBAC

Implementing RBAC provides several security advantages.

- Prevents unauthorized access to sensitive operations.

- Simplifies permission management.

- Reduces insider threats.

- Supports auditing and compliance.

- Enforces separation of duties.

- Limits the impact of compromised accounts.

Combined with JWT authentication and audit logging, RBAC forms a core component of EthioCred's defense-in-depth strategy.



# 39. Summary

Role-Based Access Control ensures that authenticated users interact only with the resources appropriate to their responsibilities.

By combining centralized authorization middleware, ownership validation, least privilege principles, and comprehensive permission matrices, EthioCred maintains strong access control while remaining scalable and easy to maintain.

The next section describes how user identities are linked to Ethiopia's Fayda Digital ID system and the additional security measures used to protect authentication sessions.

                    ADMIN

                      │

        ┌─────────────┴─────────────┐

        │                                                                       │

   UNIVERSITY                                                      SYSTEM

        │

        │

   Issues Credentials

        │

        ▼

     STUDENT

        │

 Approves Sharing

        │

        ▼

    EMPLOYER



# 40. Fayda Digital Identity Integration

EthioCred is designed to integrate with Ethiopia's national digital identity system, **Fayda**, to provide trusted identity verification.

In the current MVP, direct integration with Fayda is not implemented because the official production APIs are not publicly available for academic projects.

Instead, EthioCred simulates Fayda integration by storing each user's verified Fayda ID within the platform.

This approach allows the application to demonstrate identity-linked credential management while maintaining compatibility with future production integration.



# 41. MVP Identity Model

The MVP authentication process is illustrated below.

```text

User

↓

Email + Password Login

↓

Backend Authentication

↓

Retrieve User Record

↓

Validate Stored Fayda ID

↓

Generate JWT

↓

Authenticated Session

```

Although authentication is performed locally, every credential remains permanently linked to the user's Fayda identifier.



# 42. Future Production Architecture

In a production deployment, authentication would be delegated to the official Fayda Identity Provider.

```text

User

↓

EthioCred

↓

Redirect to Fayda Login

↓

Identity Verification

↓

OAuth2 / OpenID Connect

↓

Identity Token Returned

↓

Generate Internal JWT

↓

Protected Resources

```

In this architecture:

- Fayda verifies identity.

- EthioCred manages authorization.

- JWT tokens remain internal to EthioCred.

- Existing business logic remains unchanged.

This separation of concerns enables easier maintenance and future scalability.



# 43. Identity Mapping

Each EthioCred account is permanently associated with a unique Fayda ID.

Example database mapping:

| User | Fayda ID |

|------|----------|

| Abebe Kebede | 123456789012 |

| Hana Tesfaye | 123456789013 |

| Samuel Bekele | 123456789014 |

The Fayda ID serves as the primary identity reference throughout the credential lifecycle.

It is used to:

- Associate credentials with students.

- Route issued credentials to the correct wallet.

- Validate ownership during verification.

- Prevent identity duplication.



# 44. Identity Verification During Credential Access

Whenever a student accesses their wallet, the backend validates ownership before returning any credentials.

```text

JWT

↓

Extract User ID

↓

Retrieve User

↓

Read Fayda ID

↓

Find Credentials

↓

holder_fayda_id matches?

↓

Yes

↓

Return Credentials

```

If the authenticated Fayda ID does not match the credential owner, access is denied.



# 45. Session Security

EthioCred uses secure JWT-based sessions.

Each authenticated request must include:

```http

Authorization: Bearer <JWT>

```

The backend performs the following checks:

- JWT signature validation

- Token expiration check

- User existence verification

- Account status validation

- Role authorization

Only after all checks pass does the request proceed to the application logic.



# 46. Session Lifecycle

```text

Login

↓

Generate JWT

↓

Store Token

↓

Authenticated Requests

↓

Token Expiration

↓

Re-authentication

↓

Logout

↓

Token Removed

```

The system maintains stateless authentication, eliminating the need for server-side session storage.



# 47. Session Timeout

Access tokens have a limited lifetime.

Recommended configuration:

| Token Type | Lifetime |

|------------|----------|

| Access Token | 1 Hour |

| Refresh Token (Future) | 7 Days |

Expired tokens are automatically rejected.

Users must authenticate again or obtain a new access token using a refresh token in future versions.



# 48. Account Status Validation

Authentication alone does not grant access.

Before every protected request, EthioCred verifies the user's account status.

Supported statuses include:

| Status | Description |

|--------|-------------|

| ACTIVE | Full access |

| SUSPENDED | Login denied |

| LOCKED | Temporarily disabled after repeated failures |

| DISABLED | Account permanently disabled |

Inactive accounts cannot access protected resources even with a valid JWT.



# 49. Failed Login Protection

To reduce the risk of brute-force attacks, EthioCred limits repeated login attempts.

Recommended policy:

- Maximum 5 consecutive failed login attempts.

- Temporary account lock for 15 minutes.

- All failed attempts recorded in the audit log.

Future versions may implement adaptive rate limiting based on IP address and device fingerprint.



# 50. Multi-Factor Authentication (Future Enhancement)

Future versions of EthioCred may require Multi-Factor Authentication (MFA) for high-privilege users.

Example flow:

```text

University Login

↓

Password Verification

↓

One-Time Verification Code

↓

Successful Verification

↓

Generate JWT

```

Potential second factors include:

- Email verification codes

- Authenticator applications

- Hardware security keys

- National digital identity verification

MFA provides an additional layer of protection against credential theft.



# 51. Secure Credential Routing

When a university issues new credentials, they are not delivered through email or manual downloads.

Instead, the backend uses the student's verified Fayda ID to determine ownership.

Routing process:

```text

Credential Issued

↓

Read Student Fayda ID

↓

Lookup Matching User

↓

Store Credential

↓

Generate Notification

↓

Display in Wallet

```

This ensures credentials are delivered only to the correct identity holder.



# 52. Authentication Audit Logging

Every authentication-related event is recorded.

Examples include:

- Successful login

- Failed login

- Logout

- Password change

- Account lock

- Token expiration

- Unauthorized access attempts

Audit records include:

- User ID

- Timestamp

- IP address (future enhancement)

- Event type

- Result

These logs support security monitoring and forensic investigations.



# 53. Security Best Practices

The authentication subsystem follows several best practices.

- Passwords are hashed using bcrypt.

- JWTs are digitally signed.

- Sensitive data is never logged.

- Sessions are stateless.

- Account status is checked on every request.

- Access follows the Principle of Least Privilege.

- Authentication events are audited.

- Future integration with Fayda uses standard OAuth2/OpenID Connect protocols.

These practices improve resilience against common authentication attacks.



# 54. Summary

EthioCred's authentication architecture combines secure local authentication for the MVP with a clear migration path toward integration with Ethiopia's national Fayda identity system.

By linking every credential to a verified Fayda identifier, validating ownership before access, protecting sessions with JWTs, and applying modern authentication best practices, the platform establishes a secure and scalable identity foundation while remaining ready for future national deployment.



# 55. Authentication Threat Model

Authentication systems are common targets for cyberattacks because they protect access to sensitive resources.

EthioCred's authentication subsystem is designed using a defense-in-depth approach that mitigates common authentication threats through multiple security controls.

The following table summarizes the primary threats considered during the system's design.

| Threat | Description | Mitigation |

|----------|-------------|------------|

| Password Theft | User passwords are stolen | bcrypt hashing, strong password policy, future MFA |

| Brute Force Attack | Repeated password guessing | Login attempt limits and temporary account lockout |

| JWT Tampering | Modification of authentication tokens | JWT digital signature validation |

| Session Hijacking | Attacker steals an active session | Short-lived JWTs, HTTPS, future HTTP-only cookies |

| Privilege Escalation | User attempts unauthorized actions | Role-Based Access Control (RBAC) and ownership checks |

| Replay Attack | Reuse of intercepted authentication tokens | Token expiration and future token rotation |

| Unauthorized API Access | Direct access without authentication | Authentication middleware on protected routes |

| Identity Impersonation | User attempts to access another user's data | Fayda ID ownership validation |



# 56. Defense-in-Depth Strategy

EthioCred applies multiple layers of security rather than relying on a single protection mechanism.

```text

User Request

↓

Input Validation

↓

JWT Authentication

↓

Role Authorization

↓

Ownership Validation

↓

Business Logic

↓

Audit Logging

↓

Database

```

Each layer independently validates the request before allowing access to sensitive operations.



# 57. Security Monitoring

The platform continuously records authentication and authorization events.

Examples include:

- Successful login

- Failed login

- Logout

- Password change

- Unauthorized access attempts

- Token validation failures

- Account lockouts

- Administrative actions

Security monitoring provides visibility into user activity and supports incident investigation.



# 58. Audit Logging

Every authentication-related event generates an audit record.

Example structure:

```json

{

  "event": "LOGIN_SUCCESS",

  "userId": "uuid",

  "role": "STUDENT",

  "timestamp": "2026-07-15T09:30:00Z"

}

```

Future versions may also record:

- Source IP address

- Device information

- Browser details

- Geographic location (where appropriate and privacy-compliant)

Audit logs help detect suspicious behavior and provide accountability for administrative actions.



# 59. Authentication Sequence Diagram

The following sequence illustrates a complete authentication and authorization process.

```text

User

↓

Submit Credentials

↓

Authentication API

↓

Validate Request

↓

Retrieve User

↓

Verify Password

↓

Generate JWT

↓

Return Token

↓

Protected Request

↓

Validate JWT

↓

Validate Role

↓

Validate Ownership

↓

Controller

↓

Database

↓

Response

```

This sequence ensures that every protected request passes through multiple verification stages before accessing application resources.



# 60. Security Demonstrations

EthioCred includes controlled demonstrations that showcase how its authentication and authorization mechanisms respond to malicious behavior.

### Tampered Credential

An attacker modifies the GPA stored in a credential after it has been digitally signed.

Result:

- Signature verification fails.

- Verification request is rejected.

- Integrity violation is logged.



### Rogue Issuer

An attacker attempts to issue credentials using an unregistered institution.

Result:

- Trust Registry lookup fails.

- Issuer is rejected.

- Employer receives an "Untrusted Issuer" warning.



### Revoked Credential

A previously valid credential has been revoked by the issuing university.

Result:

- Digital signature remains valid.

- Revocation Registry detects the credential.

- Verification is denied.

These demonstrations illustrate that authenticity, trust, and revocation are verified independently.



# 61. Authentication Security Checklist

The following controls are implemented or planned within the authentication subsystem.

| Security Control | Status |

|------------------|--------|

| Password Hashing (bcrypt) | ✅ Implemented |

| JWT Authentication | ✅ Implemented |

| Role-Based Access Control | ✅ Implemented |

| Ownership Validation | ✅ Implemented |

| Audit Logging | ✅ Implemented |

| Login Attempt Limits | ✅ Implemented |

| Account Status Validation | ✅ Implemented |

| HTTPS (Production) | ✅ Planned |

| Refresh Tokens | ✅ Planned |

| Multi-Factor Authentication | ✅ Planned |

| OAuth2 / OpenID Connect (Fayda) | ✅ Planned |



# 62. Future Improvements

The authentication subsystem has been designed to support future enhancements without requiring major architectural changes.

Planned improvements include:

- Full integration with the official Fayda Identity Provider using OAuth2/OpenID Connect.

- Multi-Factor Authentication (MFA) for administrators and university registrars.

- Refresh token rotation for improved session security.

- Device recognition and trusted device management.

- Adaptive authentication based on user behavior and risk scoring.

- IP-based anomaly detection and geolocation alerts.

- Hardware Security Module (HSM) integration for JWT signing keys.

- Security Information and Event Management (SIEM) integration for centralized monitoring.

These enhancements would further strengthen the platform for large-scale production deployment.



# 63. Authentication Architecture Summary

The EthioCred authentication subsystem provides secure identity verification and access control through a layered security architecture.

Its key characteristics include:

- Secure password storage using bcrypt.

- Stateless authentication with JWT.

- Role-Based Access Control (RBAC).

- Ownership validation using Fayda identifiers.

- Comprehensive audit logging.

- Defense-in-depth security architecture.

- Future-ready integration with Ethiopia's national digital identity infrastructure.

Together, these mechanisms establish a trusted authentication framework that protects academic credentials, supports secure collaboration between institutions, students, and employers, and provides a scalable foundation for future enhancements.

