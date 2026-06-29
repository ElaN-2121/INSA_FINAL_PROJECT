# EthioCred Database Design

**Document Version:** 1.0

# 1. Introduction

The database serves as the central source of truth for the EthioCred platform.

Its primary responsibilities include:

- Managing user identities

- Maintaining trusted institutions

- Storing issued digital credentials

- Recording verification requests

- Maintaining audit trails

- Managing notifications

- Tracking credential revocations

- Supporting future blockchain integration

The database has been designed using relational modeling principles to ensure consistency, maintainability, scalability, and strong data integrity.

PostgreSQL was selected because of its mature feature set, excellent performance, JSON support, ACID compliance, and strong support for complex relationships.

# 2. Database Design Principles

The EthioCred database follows several core design principles.

## 2.1 Data Integrity

Primary keys, foreign keys, unique constraints, and validation rules ensure that inconsistent or invalid records cannot be inserted.

Examples include:

- Unique Fayda IDs

- Unique credential serial numbers

- Trusted institution references

- Valid foreign key relationships

## 2.2 Normalization

The database follows Third Normal Form (3NF).

This minimizes duplicate information while maintaining efficient relationships between entities.

Benefits include:

- Reduced redundancy

- Easier maintenance

- Improved consistency

- Lower storage requirements

## 2.3 Security

Sensitive information is protected through multiple mechanisms.

Examples include:

- Password hashing

- Encrypted private key storage

- JWT-based authentication

- Role-based authorization

- Audit logging

No plaintext passwords or private cryptographic keys are stored in the database.

## 2.4 Scalability

The schema is designed to support future growth.

Future enhancements may include:

- Multiple universities

- Additional credential types

- Permissioned blockchain

- Mobile applications

- Automated Student Information System (SIS) integration

- National-scale deployments

# 3. Why PostgreSQL?

PostgreSQL was selected as the database management system for the following reasons.

| Feature | Benefit |

|----------|----------|

| ACID Transactions | Guarantees reliable database operations |

| Foreign Keys | Enforces data relationships |

| JSONB Support | Efficient storage of credential payloads |

| Indexing | Faster verification queries |

| UUID Support | Globally unique identifiers |

| Extensions | Easy future expansion |

| High Performance | Suitable for enterprise applications |

| Open Source | No licensing cost |

# 4. Database Overview

The EthioCred database consists of ten core tables.

| Table | Purpose |

|---------|---------|

| users | Stores all authenticated users |

| institutions | Trusted universities and organizations |

| institution_keys | Public key management and key rotation |

| credentials | Issued digital credentials |

| verification_requests | Employer access requests |

| verification_logs | Verification history |

| notifications | User notifications |

| audit_logs | Security and activity logs |

| revoked_credentials | Revocation records |

| blockchain_ledger | Future blockchain integration |

Each table has a clearly defined responsibility and communicates with other tables through foreign key relationships.

# 5. High-Level Database Architecture

```text

                           PostgreSQL Database

┌────────────────────────────────────────┐

│                         USERS                                                                     │

└─────────┬──────────────────────────────┘

                          │

                          │

       ┌──────▼───────┐

        │ INSTITUTIONS            │

        └──────┬───────┘

                           │

      ┌───────┴───────────┐

      │                                                  │

      ▼                                                 ▼

INSTITUTION_KEYS                      CREDENTIALS

                            │

            ┌───────────────┼────────────────┐

            │                                        │                                        │

            ▼                                       ▼                                       ▼

VERIFICATION_REQUESTS  VERIFICATION_LOGS  REVOKED_CREDENTIALS

            │

            ▼

      NOTIFICATIONS

USERS

│

├────────► AUDIT_LOGS

CREDENTIALS

│

└────────► BLOCKCHAIN_LEDGER (Future)

```

---

# 6. Entity Relationship Overview

The relationships between the major entities are illustrated below.

```text

Institution

    │

    ├───────────────┐

    │                                        │

    ▼                                       ▼

Institution Keys                   Users

                        │

                        ▼

                  Credentials

                        │

      ┌─────────────────┼─────────────────┐

      ▼                 ▼                        ▼

Verification      Revocation       Blockchain

Requests             Record            Record

Users

│

├────────► Notifications

│

└────────► Audit Logs

```

These relationships ensure that every credential can be traced back to its issuing institution, credential holder, and complete verification history.



# 7. Primary Data Flow

The database supports three primary workflows.

## Credential Issuance

University

↓

Credential Created

↓

Credential Signed

↓

Credential Stored

↓

Notification Generated



## Credential Verification

Employer

↓

Verification Request

↓

Verification Engine

↓

Verification Log

↓

Verification Result

---

## Credential Revocation

University

↓

Credential Revoked

↓

Revocation Record Created

↓

Future Verification Blocked



# 8. Database Technologies

The MVP implementation uses the following technologies.

| Component | Technology |

|------------|------------|

| Database | PostgreSQL 16 |

| ORM | Prisma ORM |

| Query Language | SQL |

| Primary Key | UUID |

| Password Hashing | bcrypt |

| Authentication | JWT |

| Cryptography | Node.js Crypto Module |

| Data Format | JSONB |

Prisma provides type-safe database access while simplifying schema migrations and reducing boilerplate SQL code.



# 9. Database Naming Conventions

To ensure consistency throughout the project, the following conventions are used.

### Tables

- lowercase

- plural nouns

- snake_case

Examples

```

users

institutions

verification_logs

```

### Columns

- lowercase

- snake_case

Examples

```

full_name

created_at

credential_payload

```

### Primary Keys

Every table uses:

```

id UUID PRIMARY KEY

```

### Foreign Keys

Foreign keys follow the naming pattern:

```

user_id

institution_id

credential_id

```

---

# 10. Summary

The EthioCred database has been designed as a secure, normalized, and scalable relational model.

Its structure supports the complete lifecycle of a digital academic credential—from issuance and cryptographic signing to verification, audit logging, revocation, and future blockchain anchoring.

The following sections of this document describe each database table, its relationships, constraints, and implementation details.

# 11. Users Table

The `users` table stores all authenticated users within the EthioCred platform.

Instead of maintaining separate tables for students, employers, university staff, and administrators, the platform uses a role-based model.

Each user is assigned one of four predefined roles.

This approach simplifies authentication, authorization, and future maintenance.

---

## Table Structure

| Column | Type | Constraints | Description |

|----------|------|------------|-------------|

| id | UUID | PRIMARY KEY | Unique user identifier |

| full_name | VARCHAR(255) | NOT NULL | User's full name |

| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |

| password_hash | TEXT | NOT NULL | bcrypt hashed password |

| fayda_id | VARCHAR(50) | UNIQUE | National Fayda ID |

| role | VARCHAR(30) | NOT NULL | User role |

| institution_id | UUID | FK, NULLABLE | Associated institution |

| status | VARCHAR(20) | DEFAULT 'ACTIVE' | Account status |

| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation date |

| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

---

## User Roles

```text

ADMIN

UNIVERSITY

STUDENT

EMPLOYER

```

Each role determines which API endpoints and frontend features the user may access.

---

## Relationships

```text

Users

│

├──────────────► Institutions

│

├──────────────► Credentials

│

├──────────────► Notifications

│

├──────────────► Verification Requests

│

└──────────────► Audit Logs

```



## Example Record

| Field | Value |

|--------|------|

| id | 4b31... |

| full_name | Abebe Kebede |

| email | [abebe@example.com](mailto:abebe@example.com) |

| fayda_id | 123456789012 |

| role | STUDENT |

| institution_id | AAU UUID |

| status | ACTIVE |



## Design Notes

- Passwords are never stored in plaintext.

- Passwords are hashed using bcrypt.

- Fayda IDs must be unique.

- Only university users reference an institution.

- Students may optionally reference an institution if enrolled.

- Employers and administrators have a NULL institution_id.



# 12. Institutions Table

The `institutions` table represents the Trust Registry of EthioCred.

Only institutions contained within this table are permitted to issue academic credentials.

Every credential ultimately traces back to one institution.



## Table Structure

| Column | Type | Constraints | Description |

|----------|------|------------|-------------|

| id | UUID | PRIMARY KEY | Institution identifier |

| name | VARCHAR(255) | NOT NULL | Official institution name |

| organization_fayda_id | VARCHAR(50) | UNIQUE | Organization Fayda ID |

| registration_number | VARCHAR(100) | UNIQUE | Government registration |

| status | VARCHAR(20) | DEFAULT 'PENDING' | Trust status |

| approved_by | UUID | FK → users | Administrator approval |

| approved_at | TIMESTAMP | NULLABLE | Approval date |

| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration date |

## Institution Status Lifecycle

```text

PENDING

↓

UNDER_REVIEW

↓

ACTIVE

↓

SUSPENDED

↓

REVOKED

```

Only institutions with status

```text

ACTIVE

```

may issue credentials.



## Relationships

```text

Institution

│

├──────────────► Institution Keys

│

├──────────────► University Users

│

└──────────────► Credentials

```



## Example Record

| Field | Value |

|--------|------|

| name | Addis Ababa University |

| organization_fayda_id | ORG-000123 |

| registration_number | MOE-ET-2025-001 |

| status | ACTIVE |



## Administrative Approval Workflow

Institution Registration

↓

Administrator Review

↓

Ministry Validation

↓

Institution Approved

↓

Public Key Registered

↓

Institution Activated

This manual verification process prevents rogue organizations from becoming trusted issuers.



# 13. Institution Keys Table

The `institution_keys` table stores the public cryptographic keys used to verify credentials.

Separating public keys from the institutions table provides flexibility for future key rotation and compromise recovery.



## Table Structure

| Column | Type | Constraints | Description |

|----------|------|------------|-------------|

| id | UUID | PRIMARY KEY | Key identifier |

| institution_id | UUID | FK → institutions | Owning institution |

| public_key | TEXT | NOT NULL | RSA public key (PEM) |

| key_version | INTEGER | DEFAULT 1 | Version number |

| fingerprint | VARCHAR(128) | UNIQUE | SHA-256 fingerprint |

| status | VARCHAR(20) | DEFAULT 'ACTIVE' | Key status |

| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration date |

| revoked_at | TIMESTAMP | NULLABLE | Revocation date |



## Key Status Lifecycle

```text

ACTIVE

↓

ARCHIVED

↓

COMPROMISED

↓

REVOKED

```

Only ACTIVE keys are used for verifying newly issued credentials.

Archived keys remain available to validate historical credentials.



## Relationships

```text

Institution

│

└──────────────► Institution Keys

                     │

                     ├──── Version 1

                     ├──── Version 2

                     └──── Version 3

```



## Key Rotation Strategy

Future versions of EthioCred support multiple public keys for each institution.

Example

```text

Addis Ababa University

├── Key v1 (Archived)

├── Key v2 (Compromised)

└── Key v3 (Active)

```

When a private key is compromised:

1. The corresponding public key is marked as `COMPROMISED`.

2. The institution generates a new RSA key pair.

3. The new public key is registered.

4. Historical credentials continue using archived public keys.

5. New credentials are signed using the latest active key.

---

## Why Separate Keys?

Keeping public keys in a dedicated table provides several advantages:

- Supports future key rotation.

- Enables historical verification.

- Records compromised keys.

- Allows multiple active key versions if needed.

- Keeps the institutions table simple and focused on organizational data.



# 14. Entity Relationship Summary

The three core tables establish the foundation of trust for the entire EthioCred platform.

```text

                                  Institutions

                                           │

         ┌────────────┴────────────┐

         ▼                                                                ▼

Institution Keys                                                Users

                                                                            │

                                                                            ▼

                                                                     Credentials

```

Every credential issued by EthioCred can be traced to:

- The authenticated university user who initiated issuance.

- The trusted institution that authorized the issuance.

- The cryptographic public key used to verify authenticity.

This layered relationship model provides accountability, supports future key management, and ensures the integrity of the credential ecosystem.

# 15. Credentials Table

The `credentials` table serves as the primary ledger of all academic credentials issued through the EthioCred platform.

Each record represents one digitally signed academic credential issued by a trusted institution.

Unlike traditional systems that store individual fields separately, EthioCred stores the complete credential payload as a JSON document. This preserves the exact data that was cryptographically signed, ensuring consistent verification.



## Table Structure

| Column | Type | Constraints | Description |

|----------|------|------------|-------------|

| id | UUID | PRIMARY KEY | Credential identifier |

| institution_id | UUID | FK → institutions | Issuing institution |

| holder_id | UUID | FK → users | Credential owner |

| serial_number | VARCHAR(100) | UNIQUE, NOT NULL | Certificate serial number |

| credential_payload | JSONB | NOT NULL | Complete signed credential |

| digital_signature | TEXT | NOT NULL | RSA digital signature |

| signature_algorithm | VARCHAR(30) | DEFAULT 'RSA-SHA256' | Signature algorithm |

| status | VARCHAR(20) | DEFAULT 'VALID' | Credential status |

| issued_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Issue date |

| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last modification |



## Credential Status

```text

VALID

↓

REVOKED

↓

EXPIRED (Future)

↓

ARCHIVED (Future)

```



## Example Credential Payload

```json

{

  "issuer": "Addis Ababa University",

  "holder": {

    "faydaId": "123456789012",

    "fullName": "Abebe Kebede"

  },

  "degree": {

    "program": "BSc Software Engineering",

    "gpa": 3.91,

    "graduationDate": "2026-07-05"

  },

  "serialNumber": "AAU-2026-0041"

}

```



## Why JSONB?

Using PostgreSQL's JSONB data type provides several advantages:

- Stores the exact signed payload.

- Supports future credential formats.

- Reduces schema changes.

- Enables indexing of JSON fields.

- Aligns with W3C Verifiable Credential concepts.



## Relationships

```text

Institution

│

└────────► Credentials

                │

                ▼

             Student

```

Each credential belongs to:

- One trusted institution.

- One student.

- One digital signature.



## Credential Issuance Flow

```text

Registrar Uploads CSV

↓

Backend Validates Data

↓

Canonical JSON Created

↓

SHA-256 Hash Generated

↓

RSA Signature Generated

↓

Credential Stored

↓

Notification Sent

```

The stored JSON payload is identical to the payload that was cryptographically signed.



# 16. Verification Requests Table

Employers cannot immediately view a student's credential.

Instead, they submit a verification request that must be approved by the credential holder.

This table manages that consent workflow.



## Table Structure

| Column | Type | Constraints | Description |

|----------|------|------------|-------------|

| id | UUID | PRIMARY KEY | Request identifier |

| credential_id | UUID | FK → credentials | Requested credential |

| employer_id | UUID | FK → users | Requesting employer |

| status | VARCHAR(20) | DEFAULT 'PENDING' | Request status |

| requested_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Request creation |

| responded_at | TIMESTAMP | NULLABLE | Student response time |



## Request Lifecycle

```text

Employer Request

↓

PENDING

↓

Student Decision

↓

APPROVED

or

DENIED

```

Only approved requests allow employers to perform credential verification.



## Relationships

```text

Employer

│

└────────► Verification Requests

                     │

                     ▼

                Credential

```



## Example Record

| Field | Value |

|--------|------|

| credential_id | UUID |

| employer_id | UUID |

| status | APPROVED |

| requested_at | 2026-08-17 10:45 |



## Security Notes

Verification requests provide an additional privacy layer.

Students remain in control of who may access their academic credentials.



# 17. Verification Logs Table

Every verification attempt performed by the Employer Portal is permanently recorded.

These records provide accountability, support forensic analysis, and generate useful platform analytics.



## Table Structure

| Column | Type | Constraints | Description |

|----------|------|------------|-------------|

| id | UUID | PRIMARY KEY | Verification event |

| credential_id | UUID | FK → credentials | Verified credential |

| employer_id | UUID | FK → users | Employer performing verification |

| result | VARCHAR(20) | NOT NULL | Verification outcome |

| failure_reason | TEXT | NULLABLE | Failure explanation |

| verified_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Verification time |

| ip_address | VARCHAR(45) | NULLABLE | Client IP address |

| user_agent | TEXT | NULLABLE | Browser information |



## Possible Verification Results

```text

VERIFIED

FAILED

REVOKED

UNTRUSTED_ISSUER

TAMPERED

ACCESS_DENIED

```



## Example Record

| Field | Value |

|--------|------|

| result | VERIFIED |

| employer | ABC Technologies |

| verified_at | 2026-08-17 15:12 |

| failure_reason | NULL |



## Verification Flow

```text

Employer

↓

Verification Request

↓

Trust Registry Check

↓

Revocation Check

↓

Hash Verification

↓

RSA Signature Verification

↓

Verification Log Stored

```

Every verification attempt is logged regardless of whether it succeeds or fails.



# 18. Credential Lifecycle

The following diagram illustrates the complete lifecycle of a credential within EthioCred.

```text

CSV Upload

↓

Registrar Approval

↓

Credential Created

↓

Credential Signed

↓

Stored in Database

↓

Student Wallet

↓

Employer Request

↓

Student Approval

↓

Verification

↓

Verification Log

↓

(Optional)

Credential Revoked

```

Throughout its lifecycle, the credential remains linked to:

- The issuing institution.

- The credential holder.

- The verification history.

- The revocation status.

- The cryptographic signature.

This provides complete traceability from issuance to verification.



# 19. Relationship Summary

The operational tables work together to support the credential issuance and verification process.

```text

Users (Student)

        │

        ▼

Credentials

        │

        ├───────────────┐

        ▼                                      ▼

Verification                       Verification

Requests                                 Logs

       ▲

        │

Users (Employer)

```

This design separates consent management from verification history, making the database easier to maintain while preserving a complete audit trail of credential access.













# 24. Database Constraints

To ensure data integrity, EthioCred uses a combination of primary keys, foreign keys, unique constraints, and check constraints.

These constraints prevent invalid or inconsistent data from entering the database.

---

## Primary Keys

Every table uses UUIDs as primary keys.

Example:

```sql

id UUID PRIMARY KEY DEFAULT gen_random_uuid()

```

Advantages:

- Globally unique

- Difficult to guess

- Better suited for distributed systems

- Prevents sequential ID enumeration attacks

## Foreign Keys

Foreign keys maintain relationships between entities.

Examples:

| Table | Foreign Key | References |

|---------|-------------|------------|

| users | institution_id | [institutions.id](http://institutions.id) |

| credentials | institution_id | [institutions.id](http://institutions.id) |

| credentials | holder_id | [users.id](http://users.id) |

| verification_requests | credential_id | [credentials.id](http://credentials.id) |

| verification_requests | employer_id | [users.id](http://users.id) |

| verification_logs | credential_id | [credentials.id](http://credentials.id) |

| verification_logs | employer_id | [users.id](http://users.id) |

| institution_keys | institution_id | [institutions.id](http://institutions.id) |

| revoked_credentials | credential_id | [credentials.id](http://credentials.id) |

| notifications | user_id | [users.id](http://users.id) |

| audit_logs | user_id | [users.id](http://users.id) |

Foreign key constraints ensure that related records always exist before references can be created.



## Unique Constraints

Several fields require uniqueness across the entire system.

| Field | Reason |

|---------|--------|

| email | One login per account |

| fayda_id | One identity per user |

| organization_fayda_id | One record per institution |

| registration_number | Prevent duplicate institutions |

| serial_number | Prevent duplicate certificates |

| fingerprint | Prevent duplicate RSA public keys |



## Check Constraints

Check constraints validate acceptable values.

Examples:

User roles

```sql

CHECK (

role IN (

'ADMIN',

'UNIVERSITY',

'STUDENT',

'EMPLOYER'

))

```

Credential status

```sql

CHECK (

status IN (

'VALID',

'REVOKED',

'EXPIRED',

'ARCHIVED'

))

```

Institution status

```sql

CHECK (

status IN (

'PENDING',

'UNDER_REVIEW',

'ACTIVE',

'SUSPENDED',

'REVOKED'

))

```

# 25. Database Indexing Strategy

Indexes improve query performance by reducing search time.

The following indexes are recommended.

| Index | Purpose |

|---------|----------|

| users(email) | User login |

| users(fayda_id) | Wallet lookup |

| credentials(serial_number) | Certificate lookup |

| credentials(holder_id) | Student wallet |

| credentials(institution_id) | University reports |

| verification_logs(verified_at) | Reporting |

| verification_requests(status) | Pending approvals |

| notifications(user_id) | Notification retrieval |

| audit_logs(timestamp) | Security analysis |

Additional JSONB indexes may be added to the credential payload for frequently queried fields.



# 26. Relationship Cardinality

The following cardinalities define how entities interact.

```text

Institution

1 ────────────< Many Users

Institution

1 ────────────< Many Credentials

Institution

1 ────────────< Many Institution Keys

User

1 ────────────< Many Credentials

User

1 ────────────< Many Notifications

User

1 ────────────< Many Audit Logs

Employer

1 ────────────< Many Verification Requests

Credential

1 ────────────< Many Verification Logs

Credential

1 ────────────1 Revocation Record

```

These relationships ensure complete traceability across the credential lifecycle.

# 27. Database Normalization

The EthioCred database follows Third Normal Form (3NF).

### First Normal Form (1NF)

- Atomic values

- No repeating groups

### Second Normal Form (2NF)

- Every non-key attribute depends on the entire primary key

### Third Normal Form (3NF)

- No transitive dependencies

- Related information stored only once

Normalization minimizes redundancy while maintaining consistency.

# 28. Backup and Recovery Strategy

To protect against data loss, the database should be backed up regularly.

Recommended strategy:

| Backup Type | Frequency |

|--------------|-----------|

| Full Backup | Daily |

| Incremental Backup | Every 6 Hours |

| Transaction Log Backup | Every Hour |

Backups should be:

- Encrypted

- Versioned

- Stored off-site

- Regularly tested through restoration drills

# 29. Security Considerations

The database stores highly sensitive academic records and therefore follows several security best practices.

## Authentication

- JWT-based authentication

- Passwords hashed using bcrypt

---

## Authorization

Role-Based Access Control (RBAC)

Supported roles:

- Administrator

- University

- Student

- Employer

Each role is granted only the minimum permissions necessary.

## Encryption

Sensitive data includes:

- Password hashes

- Digital signatures

- Public key fingerprints

University private keys are **never stored** in the PostgreSQL database.

Instead, they remain encrypted in the secure application key vault and are loaded into memory only during credential issuance.

## Audit Logging

Every security-sensitive action generates an audit record.

Examples include:

- Login

- Credential issuance

- Credential revocation

- Verification request approval

- Verification execution

- Institution approval

Audit records support forensic investigations and accountability.



# 30. Sample Queries

## Retrieve Student Credentials

```sql

SELECT *

FROM credentials

WHERE holder_id = $1;

```



## Retrieve Pending Verification Requests

```sql

SELECT *

FROM verification_requests

WHERE status = 'PENDING';

```



## Verification History

```sql

SELECT *

FROM verification_logs

ORDER BY verified_at DESC;

```



## Institution Credentials

```sql

SELECT *

FROM credentials

WHERE institution_id = $1;

```



## Revoked Credentials

```sql

SELECT *

FROM revoked_credentials;

```



# 31. Future Database Expansion

The current schema supports future enhancements without requiring major redesign.

Planned additions include:

- Permissioned blockchain metadata

- Multi-language credential support

- Additional credential types

- Digital transcripts

- Professional certifications

- Degree attachments

- QR verification analytics

- Institution analytics

- Mobile device registration

These features can be integrated through additional tables while preserving existing relationships.



# 32. Database Architecture Summary

The EthioCred database provides a secure, normalized, and scalable foundation for digital academic credential management.

Its architecture supports:

- Trusted institution management

- Secure user authentication

- Digital credential issuance

- Cryptographic verification

- Employer consent workflows

- Credential revocation

- Security audit logging

- Future blockchain integration

By combining relational integrity with modern PostgreSQL features such as UUIDs and JSONB, the database balances flexibility with strong consistency and security.

The design enables EthioCred to function as a robust academic credential verification platform while remaining extensible for future national-scale deployment.

# 31. Database Relationships

EthioCred uses a relational database model to ensure that all records remain consistent, traceable, and easy to query.

Relationships between entities are enforced using foreign key constraints to prevent orphaned records and maintain referential integrity.

The primary relationships are:

- One Institution → Many Credentials

- One Credential → Many Verification Requests

- One Credential → Many Audit Logs

- One Institution → Many Key History Records (Future)

# 32. Entity Relationship Overview

```text

+-------------------+

|   institutions    |

+-------------------+

| id (PK)           |

| name              |

| public_key        |

| status            |

+---------+---------+

          |

          | 1

          |

          | *

+---------v---------+

|    credentials    |

+-------------------+

| id (PK)           |

| issuer_id (FK)    |

| holder_fayda_id   |

| serial_number     |

| digital_signature |

| status            |

+---------+---------+

          |

          | 1

          |

          | *

+---------v------------------+

| verification_requests      |

+----------------------------+

| id (PK)                    |

| credential_id (FK)          |

| employer_fayda_id           |

| status                      |

+-----------------------------+

          |

          | 1

          |

          | *

+---------v---------+

|    audit_logs     |

+-------------------+

| id (PK)           |

| credential_id(FK) |

| event             |

| timestamp         |

+-------------------+

```

This structure ensures that every credential can be traced back to its issuing institution while maintaining a complete verification history.

# 33. Foreign Key Constraints

Foreign keys enforce valid relationships between tables.

### Credentials → Institutions

```sql

issuer_id REFERENCES institutions(id)

```

A credential cannot exist unless it was issued by a registered institution.

### Verification Requests → Credentials

```sql

credential_id REFERENCES credentials(id)

```

Every verification request must reference an existing credential.

### Audit Logs → Credentials

```sql

credential_id REFERENCES credentials(id)

```

Every security event must be associated with a valid credential.

# 34. Unique Constraints

Certain values must remain unique across the system.

| Field | Reason |

|--------|--------|

| Institution Fayda Organization ID | Prevent duplicate institutions |

| Certificate Serial Number | Prevent duplicate credentials |

| Institution Public Key | Prevent duplicate key registration |

| Credential UUID | Global uniqueness |

| Verification Request UUID | Unique request tracking |

Unique constraints eliminate duplicate records and strengthen data integrity.

# 35. Data Integrity Rules

The database enforces several business rules.

### Institution Rules

- Institution must be ACTIVE before issuing credentials.

- Institution names must be unique.

- Every institution must possess a registered public key.

### Credential Rules

- Every credential must belong to one institution.

- Every credential must contain a valid digital signature.

- Certificate serial numbers cannot be reused.

- Revoked credentials remain in the database.

### Verification Rules

- Verification requests must reference valid credentials.

- Requests cannot bypass consent.

- Every verification attempt is logged.

# 36. Cascading Behavior

EthioCred avoids deleting important records.

Instead of deleting data, records are marked with status values.

Examples:

```text

ACTIVE

↓

SUSPENDED

↓

REVOKED

```

This preserves historical information for auditing purposes.

Foreign keys therefore use restricted deletion policies.

Example:

```sql

ON DELETE RESTRICT

```

This prevents accidental removal of institutions that have already issued credentials.

# 37. Credential Lifecycle in the Database

```text

Institution Approved

↓

Credential Issued

↓

Stored in Database

↓

Student Accesses Wallet

↓

Employer Requests Verification

↓

Verification Logged

↓

Credential Revoked (Optional)

↓

Historical Record Preserved

```

The lifecycle demonstrates that records remain permanently available for auditing and verification.

# 38. Future Database Extensions

The database schema has been designed to support future enhancements without major restructuring.

Planned additions include:

- Key History Table

- Blockchain Transaction Table

- Smart Contract Reference Table

- Decentralized Identifier (DID) Table

- Credential Sharing History

- Notification Queue

- Institution Security Events

These tables will extend the platform while maintaining compatibility with the current schema.

# 39. Summary

The relational database design provides a secure and structured foundation for EthioCred.

Through foreign key relationships, unique constraints, integrity rules, and audit-friendly data retention policies, the database ensures that every credential remains traceable to its issuing institution and every verification action is recorded for accountability.

The schema is intentionally modular, allowing future expansion to support blockchain integration, key lifecycle management, and additional security features without disrupting existing functionality.