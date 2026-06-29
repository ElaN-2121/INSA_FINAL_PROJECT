# EthioCred – System Architecture

**Document Version:** 1.0  
**Project:** EthioCred – Secure Academic Credential Verification Platform  
**Architecture Style:** Layered Monolithic Architecture (MVP) with Modular Services  
**Technology Stack:** React + Node.js + Express + PostgreSQL + Node Crypto API

# 1. Introduction

## 1.1 Purpose

This document describes the complete system architecture of EthioCred, a secure digital academic credential issuance and verification platform. It defines the system's major components, architectural principles, data flow, communication patterns, trust relationships, and security mechanisms.

The architecture serves as the technical blueprint for implementing the platform and provides a shared understanding for developers, supervisors, and future maintainers.

# 1.2 System Overview

EthioCred is a secure web-based platform designed to modernize academic credential management through the use of public key cryptography, trusted institution registration, secure identity mapping, and automated verification.

Instead of relying on manually inspected paper certificates, every academic credential issued through EthioCred is digitally signed using the issuing university's private RSA key. Employers can independently verify the authenticity and integrity of a credential using the corresponding public key stored in the system's Trust Registry.

The platform consists of three independent client applications communicating with a centralized REST API backed by PostgreSQL and a dedicated cryptographic subsystem.

The MVP follows a centralized architecture while remaining extensible for future integration with permissioned blockchain networks and distributed verification services.

# 2. Architectural Goals

The architecture has been designed around the following engineering objectives:

### Security

Ensure that every issued credential can be cryptographically verified and cannot be modified without detection.

### Trust

Only authorized and manually verified educational institutions may issue credentials.

### Scalability

Support the addition of universities, employers, credential types, and future distributed technologies without major architectural redesign.

### Maintainability

Separate responsibilities into modular components that are easy to extend, test, and maintain.

### Performance

Provide near real-time credential verification while supporting batch issuance for graduating students.

### Extensibility

Allow future integration of:

- Permissioned blockchain
- Mobile applications
- Real Fayda authentication
- Notification services
- External university APIs
- Background job queues

without changing the core business logic.

# 3. Architectural Principles

EthioCred follows several well-established software engineering principles.

## 3.1 Separation of Concerns

Each major responsibility is isolated into its own module.


| Component            | Responsibility           |
| -------------------- | ------------------------ |
| Frontend             | User interaction         |
| Backend API          | Business logic           |
| Database             | Persistent storage       |
| Crypto Module        | Signing and verification |
| Trust Registry       | Institution validation   |
| Audit Service        | Activity logging         |
| Notification Service | User notifications       |


This separation minimizes coupling and improves maintainability.

## 3.2 Layered Architecture

The system is divided into logical layers.

```text
┌──────────────────────────────────────────┐
│            Presentation Layer            │
│   React Applications (3 Portals)         │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│             REST API Layer               │
│        Node.js + Express Server          │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│          Business Logic Layer            │
│ Authentication │ Credentials │ Crypto    │
│ Verification │ Audit │ Notifications     │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│           Persistence Layer              │
│             PostgreSQL                   │
└──────────────────────────────────────────┘

```

Each layer communicates only with the layer directly below it, ensuring clear separation of responsibilities.

# 4. High-Level System Architecture

EthioCred consists of three independent frontend applications connected to a centralized backend service.

```text
                         EthioCred Platform

 ┌───────────────────────────────────────────────────────────────┐
 │                                                               │
 │                    React Frontend Clients                     │
 │                                                               │
 │  ┌──────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
 │  │ User Wallet  │  │ University      │  │ Employer Portal  │  │
 │  │              │  │ Portal          │  │                  │  │
 │  └──────┬───────┘  └────────┬────────┘  └────────┬─────────┘  │
 └─────────┼───────────────────┼────────────────────┼────────────┘
           │                   │                    │
           │ HTTPS / JSON      │ HTTPS / CSV        │ HTTPS / JSON
           ▼                   ▼                    ▼

 ┌───────────────────────────────────────────────────────────────┐
 │                    Node.js + Express API                      │
 │                                                               │
 │ Authentication │ Credentials │ Verification │ Crypto │ Audit │
 └───────────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼─────────────────┐
         ▼               ▼                 ▼

 ┌──────────────┐  ┌───────────────┐  ┌────────────────┐
 │ PostgreSQL   │  │ Crypto Module │  │ Trust Registry │
 │ Database     │  │ RSA + SHA-256 │  │ Public Keys    │
 └──────────────┘  └───────────────┘  └────────────────┘

```

The backend acts as the central orchestrator responsible for coordinating communication between all frontend applications and the underlying security services.

# 5. Core System Components

The EthioCred platform is composed of seven primary architectural components.

## 5.1 User Wallet

The User Wallet is the primary interface for graduates.

Responsibilities include:

- Authenticate using Fayda-linked credentials (simulated for MVP)
- View issued credentials
- Accept or reject employer verification requests
- Generate QR codes
- View notification history
- Download credential information

The wallet never generates or modifies digital signatures.

Its role is limited to secure presentation and controlled sharing.

## 5.2 University Portal

The University Portal is used exclusively by authorized registrar staff.

Its primary responsibilities include:

- Upload graduation batches
- Preview uploaded student data
- Validate CSV formatting
- Issue digitally signed credentials
- Revoke issued credentials
- View issuance history
- Manage institutional information

Only the University Portal is permitted to trigger the credential signing pipeline.

## 5.3 Employer Portal

The Employer Portal allows employers to verify credentials submitted by applicants.

Responsibilities include:

- Employer authentication
- Submit verification requests
- Scan QR codes
- Verify credential authenticity
- Display verification results
- Maintain verification history

The Employer Portal never performs cryptographic operations locally.

All verification occurs on the backend.

# 6. Architectural Characteristics

The MVP architecture possesses the following characteristics:


| Characteristic     | Description                      |
| ------------------ | -------------------------------- |
| Architecture Style | Layered Monolithic               |
| Communication      | RESTful HTTP APIs                |
| Authentication     | JWT-Based                        |
| Authorization      | Role-Based Access Control (RBAC) |
| Database           | PostgreSQL                       |
| Cryptography       | RSA-2048/4096 + SHA-256          |
| Identity Mapping   | Fayda ID (Simulated)             |
| Deployment         | Centralized                      |
| Blockchain         | Planned Future Enhancement       |


# 7. Design Philosophy

EthioCred is not simply a certificate management application.

It is designed as a **digital trust infrastructure**.

Traditional systems ask:

> "Does this certificate look genuine?"

EthioCred instead asks:

> "Can this credential be mathematically proven to originate from a trusted institution, remain unaltered since issuance, and still be considered valid today?"

By shifting trust from visual inspection to cryptographic verification, the platform provides significantly stronger guarantees of authenticity, integrity, and accountability.

This philosophy guides every architectural decision made throughout the system.

# 8. Detailed Component Architecture

The EthioCred platform follows a modular layered architecture where each component has a clearly defined responsibility. Communication between components occurs exclusively through the Backend API, ensuring loose coupling and centralized enforcement of business rules and security policies.

The platform is composed of four architectural layers:

1. Presentation Layer
2. Application Layer
3. Security Layer
4. Data Layer

# 8.1 Complete System Architecture

```text
                                      ETHIOCRED PLATFORM

┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PRESENTATION LAYER                                       │
│                                                                                            │
│ ┌──────────────────┐   ┌────────────────────┐   ┌────────────────────┐                     │
│ │ User Wallet      │   │ University Portal  │   │ Employer Portal    │                     │
│ │ (React + Vite)   │   │ (React + Vite)     │   │ (React + Vite)     │                     │
│ └─────────┬────────┘   └──────────┬─────────┘   └──────────┬─────────┘                     │
└───────────┼───────────────────────┼─────────────────────────┼──────────────────────────────┘
            │                       │                         │
            │ HTTPS / REST API      │ HTTPS / REST API        │ HTTPS / REST API
            ▼                       ▼                         ▼

┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 APPLICATION LAYER                                          │
│                                                                                            │
│                           Node.js + Express Backend                                        │
│                                                                                            │
│ ┌─────────────┐ ┌────────────┐ ┌─────────────┐ ┌──────────────┐                            │
│ │ Auth Module │ │ User Mgmt  │ │ Credentials │ │ Verification │                            │
│ └─────────────┘ └────────────┘ └─────────────┘ └──────────────┘                            │
│                                                                                            │
│ ┌─────────────┐ ┌────────────┐ ┌─────────────┐ ┌──────────────┐                            │
│ │ Institution │ │ CSV Import │ │ Notifications│ │ Audit Logs  │                            │
│ └─────────────┘ └────────────┘ └─────────────┘ └──────────────┘                            │
└────────────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼

┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SECURITY LAYER                                           │
│                                                                                            │
│ ┌─────────────────┐   ┌────────────────────┐   ┌────────────────────┐                      │
│ │ RSA Signing     │   │ SHA-256 Hashing    │   │ Trust Registry     │                      │
│ └─────────────────┘   └────────────────────┘   └────────────────────┘                      │
│                                                                                            │
│ ┌─────────────────┐   ┌────────────────────┐                                               │
│ │ Key Vault       │   │ JWT Authentication │                                               │
│ └─────────────────┘   └────────────────────┘                                               │
└────────────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼

┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     DATA LAYER                                             │
│                                                                                            │
│                             PostgreSQL Database                                            │
│                                                                                            │
│ Users │ Institutions │ Credentials │ Verification Requests │ Audit │ Notifications         │
└────────────────────────────────────────────────────────────────────────────────────────────┘

```

# 9. Presentation Layer

The Presentation Layer consists of three independent React applications.

Each application serves a different category of users while consuming the same centralized REST API.

This separation ensures that each user only interacts with functionality relevant to their role.

## 9.1 User Wallet

The User Wallet is designed for graduates and credential holders.

Primary responsibilities include:

- User authentication
- Viewing issued credentials
- Viewing credential details
- Managing employer verification requests
- Granting or denying access
- Viewing notification history
- Displaying QR codes
- Downloading credentials

The wallet never performs cryptographic operations.

It only displays information returned by the backend after successful verification.

## 9.2 University Portal

The University Portal is reserved for authorized registrar staff.

Responsibilities include:

- Secure login
- Upload graduation batches
- Preview uploaded records
- Validate CSV files
- Issue digital credentials
- Revoke credentials
- View issuance statistics
- Manage institutional information

The University Portal is the only client permitted to initiate the credential issuance pipeline.

## 9.3 Employer Portal

The Employer Portal enables employers to verify applicant credentials.

Responsibilities include:

- Employer authentication
- Submit verification requests
- Scan QR codes
- View verification reports
- View verification history
- Download verification summaries

Unlike the University Portal, the Employer Portal cannot modify credentials.

Its sole responsibility is verification.

# 10. Application Layer

The Application Layer contains the core business logic of EthioCred.

This layer is implemented using Node.js and Express following the MVC (Model–View–Controller) architectural pattern.

Every request from the frontend passes through this layer before reaching the database.

The backend enforces:

- Authentication
- Authorization
- Validation
- Business rules
- Cryptographic operations
- Logging
- Notification dispatching

No frontend application communicates directly with PostgreSQL.

This ensures that all security policies are centrally enforced.

# 11. Internal Backend Modules

To improve maintainability and scalability, the backend is divided into specialized modules.


| Module                 | Responsibility                               |
| ---------------------- | -------------------------------------------- |
| Authentication         | Login, JWT, RBAC                             |
| User Management        | Student and employer accounts                |
| Institution Management | University registration and trust management |
| Credential Management  | Issue, retrieve, revoke credentials          |
| Verification Engine    | Verify credentials and signatures            |
| Cryptography Service   | RSA signing and SHA-256 hashing              |
| CSV Import Service     | Process graduation batches                   |
| Notification Service   | User notifications                           |
| Audit Service          | Security logging                             |
| Trust Registry Service | Public key management                        |


Each module operates independently while communicating through well-defined service interfaces.

# 12. Request Lifecycle

Every request entering the backend follows the same processing pipeline.

```text
Client Request
      │
      ▼
Express Router
      │
      ▼
Authentication Middleware
      │
      ▼
Authorization Middleware
      │
      ▼
Request Validation
      │
      ▼
Controller
      │
      ▼
Business Service
      │
      ▼
Database / Crypto Module
      │
      ▼
Response Formatter
      │
      ▼
JSON Response

```

This standardized pipeline ensures consistency across all API endpoints.

It also simplifies debugging, testing, and future feature development.

# 13. Architectural Benefits

This modular architecture provides several advantages:

### Separation of Responsibilities

Each component performs one clearly defined task.

### Improved Maintainability

Modules can be modified independently with minimal impact on the rest of the system.

### Scalability

New services, portals, or verification methods can be introduced without redesigning the entire application.

### Enhanced Security

All requests pass through centralized authentication, authorization, validation, and auditing before accessing business logic.

### Testability

Individual services can be unit tested independently, improving software quality and reliability.

# 14. Security and Trust Architecture

Security is the foundation of the EthioCred platform. Every architectural decision is designed to ensure that academic credentials remain authentic, tamper-proof, verifiable, and trustworthy throughout their lifecycle.

Unlike traditional credential management systems that rely primarily on visual inspection or manual verification, EthioCred establishes trust using modern cryptographic techniques, institutional validation, and strict authorization controls.

The platform is built upon five security pillars:

- Trusted Institutions
- Digital Signatures
- Data Integrity
- Identity Verification
- Auditability

Together, these mechanisms ensure that only legitimate institutions can issue credentials, only authorized users can access them, and any unauthorized modification is immediately detected.

# 15. Trust Architecture

EthioCred follows a centralized trust model for its MVP implementation.

Instead of allowing any organization to issue credentials, every institution must first become a trusted issuer.

Only trusted institutions are permitted to generate valid academic credentials.

```text
                         Trust Architecture

             University Applies for Registration
                           │
                           ▼
                  EthioCred Administrator
                           │
          Manual Document Verification
                           │
                           ▼
          Ministry of Education Validation
                           │
                           ▼
              Institution Approved
                           │
                           ▼
             Public Key Registered
                           │
                           ▼
          Institution Added to Trust Registry
                           │
                           ▼
        Institution May Issue Credentials

```

This process establishes the root of trust for the entire platform.

# 16. Institution Onboarding Process

To prevent unauthorized organizations from issuing fraudulent credentials, every educational institution must complete an administrative verification process before joining the network.

## Step 1 — Registration Request

The institution submits:

- Institution name
- Official registration documents
- Government license
- Organization Fayda ID
- Contact information

## Step 2 — Administrative Review

An EthioCred administrator manually verifies:

- Ministry of Education accreditation
- Institutional legitimacy
- Registration status
- Organization identity

## Step 3 — Cryptographic Registration

Once approved:

- The institution generates an RSA key pair.
- The private key remains securely stored by the institution.
- The public key is uploaded to the EthioCred Trust Registry.

Only the public key is shared.

The private key is never transmitted or stored in the database.

## Step 4 — Activation

The institution becomes an authorized credential issuer.

Future credentials signed using its registered private key can now be verified by employers.

# 17. Trust Registry

The Trust Registry serves as the platform's Certificate Authority (CA) equivalent.

Its primary purpose is to maintain a list of trusted institutions and their associated public keys.

Every credential verification begins by consulting the Trust Registry.

```text
Credential
      │
      ▼
Issuer ID
      │
      ▼
Trust Registry
      │
      ├───────────────┐
      │               │
      ▼               ▼
Issuer Found?       Not Found
      │               │
      ▼               ▼
Continue         Verification Failed

```

Each registered institution contains:

- Institution ID
- Organization Fayda ID
- Institution name
- Public RSA key
- Institution status
- Approval timestamp
- Key version
- Administrator approval record

The Trust Registry is considered the root of institutional trust.

# 18. Cryptographic Architecture

EthioCred uses asymmetric cryptography to establish authenticity.

Two complementary algorithms are employed.

## SHA-256

Responsible for:

- Data integrity
- Message digest generation
- Tamper detection

## RSA-2048 / RSA-4096

Responsible for:

- Digital signatures
- Credential authenticity
- Non-repudiation

Together they provide complete credential verification.

```text
Credential Data
        │
        ▼
Canonical JSON
        │
        ▼
SHA-256 Hash
        │
        ▼
RSA Private Key
        │
        ▼
Digital Signature
        │
        ▼
Credential Package

```

# 19. Private Key Management

Private keys represent the highest-value cryptographic asset within the system.

To minimize exposure, EthioCred follows the principle of key isolation.

For the MVP:

- Private keys are stored outside the database.
- Keys are encrypted using AES-256-GCM before storage.
- Encrypted keys are referenced through environment variables.
- Keys are decrypted only in application memory during credential issuance.
- Plaintext keys are never written to logs or persisted to disk.

This approach significantly reduces the attack surface while remaining practical for an academic prototype.

# 20. Credential Signing Pipeline

Credential issuance follows a deterministic cryptographic pipeline.

```text
CSV Upload
      │
      ▼
Validation
      │
      ▼
Preview
      │
      ▼
Registrar Approval
      │
      ▼
For Each Student
      │
      ▼
Canonicalize Data
      │
      ▼
SHA-256 Hash
      │
      ▼
RSA Digital Signature
      │
      ▼
Credential Object
      │
      ▼
Store in PostgreSQL
      │
      ▼
Notify Student Wallet

```

Only after successful signing is a credential considered officially issued.

# 21. Verification Engine

The Verification Engine is responsible for determining whether a credential should be trusted.

Verification is intentionally performed as a sequence of independent security checks.

```text
Receive Credential
        │
        ▼
Validate Request
        │
        ▼
Retrieve Issuer
        │
        ▼
Issuer Trusted?
        │
        ├──── No ───► Reject
        │
        ▼
Credential Revoked?
        │
        ├──── Yes ──► Reject
        │
        ▼
Recalculate SHA-256 Hash
        │
        ▼
Verify RSA Signature
        │
        ├──── Invalid ─► Reject
        │
        ▼
Credential Verified

```

A credential is accepted only if every stage succeeds.

# 22. Credential Revocation

Digital signatures prove authenticity but do not guarantee continued validity.

A credential may later become invalid due to:

- Administrative error
- Academic misconduct
- Degree cancellation
- Duplicate issuance
- Legal requirements

To support these scenarios, EthioCred maintains a revocation mechanism.

Instead of deleting credentials, revoked credentials remain in the database with an updated status.

This preserves historical records while preventing future verification.

```text
Credential
      │
      ▼
Revoked
      │
      ▼
Verification Request
      │
      ▼
Revocation Check
      │
      ▼
Verification Blocked

```

# 23. Key Rotation and Compromise Management

Although the MVP assumes one active key per institution, the architecture supports future key rotation.

Each institution may eventually maintain multiple public keys.

```text
Institution

├── Key Version 1 (Archived)

├── Key Version 2 (Revoked)

└── Key Version 3 (Active)

```

If a private key is compromised:

1. The administrator marks the associated key as compromised.
2. The institution's active issuing privileges are suspended.
3. New credentials cannot be issued using the compromised key.
4. Previously issued credentials remain verifiable using historical key records.
5. A replacement key pair is generated and registered.

This design preserves trust while minimizing disruption.

# 24. Security Principles

EthioCred enforces defense in depth through multiple independent security mechanisms.


| Security Goal       | Mechanism                  |
| ------------------- | -------------------------- |
| Authentication      | JWT                        |
| Authorization       | Role-Based Access Control  |
| Integrity           | SHA-256                    |
| Authenticity        | RSA Digital Signatures     |
| Institutional Trust | Trust Registry             |
| Revocation          | Credential Status Check    |
| Accountability      | Audit Logs                 |
| Confidentiality     | AES-encrypted Private Keys |
| Identity Mapping    | Fayda ID                   |


No single mechanism is solely responsible for platform security.

Instead, multiple layers work together to protect the integrity of the credential ecosystem.

# 25. Security Validation Suite

## 25.1 Overview

The EthioCred Security Validation Suite is a collection of controlled attack demonstrations designed to validate the platform's security architecture under realistic adversarial conditions.

Rather than demonstrating only successful system operation, these scenarios intentionally simulate common attacks against academic credential systems and illustrate how EthioCred detects and prevents them.

Each attack is executed in a controlled environment using the completed MVP.

The Security Validation Suite validates the effectiveness of:

- RSA Digital Signatures
- SHA-256 Integrity Verification
- Trust Registry Validation
- Credential Revocation
- Audit Logging
- Verification Engine

The objective is not only to demonstrate successful verification but also to prove that the system correctly rejects malicious or invalid credentials.

# 26. Verification Decision Pipeline

Every credential submitted to the Employer Portal follows the same verification sequence.

Each step must succeed before the next one is executed.

```text
Employer Requests Verification
            │
            ▼
Validate Request Format
            │
            ▼
Retrieve Credential
            │
            ▼
Credential Exists?
            │
        No ─────────► Reject
            │
            ▼
Issuer Exists?
            │
        No ─────────► Reject
            │
            ▼
Issuer Trusted?
            │
        No ─────────► Reject
            │
            ▼
Credential Revoked?
            │
       Yes ─────────► Reject
            │
            ▼
Recalculate SHA-256 Hash
            │
            ▼
Verify RSA Signature
            │
      Invalid ──────► Reject
            │
            ▼
Verification Successful

```

This layered approach ensures that no single security mechanism is solely responsible for trust.

# 27. Attack Scenario 1 — Credential Tampering

## Objective

Demonstrate that modifying any part of a digitally signed credential immediately invalidates its signature.

## Attack Description

A malicious user attempts to improve their academic record by modifying an issued credential.

Example:

Original GPA

```
2.80

```

Modified GPA

```
3.95

```

The attacker changes only the credential data while leaving the original RSA signature untouched.

## Attack Workflow

```text
Legitimate Credential

↓

Attacker Modifies GPA

↓

Original Signature Remains

↓

Employer Requests Verification

↓

Backend Recalculates SHA-256 Hash

↓

Hash Comparison Fails

↓

Verification Rejected

```

## Backend Detection Process

During verification:

1. The backend reconstructs the credential payload.
2. The payload is canonicalized.
3. A new SHA-256 hash is generated.
4. The RSA signature is verified using the institution's public key.
5. The verification process fails because the newly generated hash no longer matches the signed hash.

## Expected Employer Portal Result

```
❌ CRITICAL ERROR

Integrity Check Failed

This credential has been modified after issuance.

Verification Status:

FAILED

```

## Security Principle Demonstrated

Integrity

Digital signatures guarantee that any unauthorized modification becomes immediately detectable.

# 28. Attack Scenario 2 — Rogue Issuer

## Objective

Demonstrate that a valid RSA signature alone is insufficient unless the issuing institution is trusted.

## Attack Description

A fake university generates its own RSA key pair.

It creates a professionally formatted degree and signs it using its private key.

The attacker attempts to convince an employer that the credential is genuine.

However, the institution has never been approved by EthioCred administrators.

Its public key does not exist inside the Trust Registry.

## Attack Workflow

```text
Fake University

↓

Generate RSA Keys

↓

Issue Fake Degree

↓

Employer Requests Verification

↓

Trust Registry Lookup

↓

Issuer Not Found

↓

Verification Rejected

```

## Backend Detection Process

Before any cryptographic verification occurs:

1. The backend extracts the issuer identifier.
2. The Trust Registry is queried.
3. The issuer cannot be found.
4. Verification terminates immediately.

RSA verification is never performed.

## Expected Employer Portal Result

```
❌ VERIFICATION FAILED

Issuer Not Trusted

The issuing institution is not registered within the EthioCred Trust Network.

```

## Security Principle Demonstrated

Trust

Only institutions approved through the Trust Registry may issue credentials.

# 29. Attack Scenario 3 — Revoked Credential Reuse

## Objective

Demonstrate that valid signatures do not override credential revocation.

## Attack Description

A university issues a legitimate credential.

Later, the institution revokes it because:

- Academic misconduct
- Administrative error
- Duplicate issuance
- Degree cancellation

The graduate still possesses the original credential and attempts to present it to an employer.

## Attack Workflow

```text
Valid Credential

↓

University Revokes Credential

↓

Credential Stored as Revoked

↓

Graduate Shares Old QR Code

↓

Employer Requests Verification

↓

Revocation Lookup

↓

Verification Blocked

```

## Backend Detection Process

The backend performs:

1. Trust Registry lookup.
2. Credential lookup.
3. Revocation lookup.

If the credential status equals

```
REVOKED

```

verification immediately stops.

RSA verification is unnecessary because revoked credentials are considered invalid regardless of signature validity.

## Expected Employer Portal Result

```
❌ ACCESS DENIED

Credential Status

REVOKED

Revocation Date

2026-08-17

Reason

Academic Misconduct

```

## Security Principle Demonstrated

Lifecycle Management

Authenticity does not imply continued validity.

# 30. Audit Logging

Every verification request generates an immutable audit event.

Example audit record:


| Field               | Value                  |
| ------------------- | ---------------------- |
| Timestamp           | 2026-08-17 14:42 UTC   |
| Employer            | ABC Technologies       |
| Student Fayda ID    | ************           |
| Credential Serial   | AAU-2026-0045          |
| Verification Result | FAILED                 |
| Failure Reason      | Integrity Check Failed |


These records enable forensic investigation and provide accountability for all verification attempts.

# 31. Demonstration Strategy

During the project defense, each attack scenario should be demonstrated live.

The recommended presentation setup consists of two synchronized windows:

### Window 1

Attacker View

Examples:

- Developer Mode
- Modified Credential
- Fake University Portal
- Revoked Credential

### Window 2

Employer Portal

Displays:

- Verification request
- Backend processing
- Verification outcome
- Security warnings

This side-by-side demonstration allows the evaluation panel to observe both the attack and the platform's defensive response in real time.

# 32. Security Guarantees

The Security Validation Suite demonstrates that EthioCred provides the following guarantees:


| Security Property | Demonstrated By                |
| ----------------- | ------------------------------ |
| Authenticity      | Trusted Issuer Validation      |
| Integrity         | Credential Tampering Detection |
| Trust             | Trust Registry Verification    |
| Revocation        | Revoked Credential Blocking    |
| Accountability    | Audit Logging                  |
| Non-Repudiation   | RSA Digital Signatures         |


The successful completion of these demonstrations provides practical evidence that EthioCred's layered security architecture functions as intended under adversarial conditions.

# 33. Future Architecture and Scalability

## 33.1 Overview

Although the current EthioCred implementation follows a centralized architecture, the system has been intentionally designed with scalability, extensibility, and future decentralization in mind.

The MVP focuses on delivering a secure, production-inspired credential issuance and verification platform using established technologies such as React, Node.js, Express, PostgreSQL, and modern public key cryptography.

As adoption grows, the architecture can evolve into a distributed trust platform without requiring significant changes to the existing business logic.

The long-term vision is to transform EthioCred into a national academic credential verification infrastructure capable of supporting universities, employers, government agencies, and graduates across Ethiopia.

# 34. Architectural Evolution

The planned evolution of EthioCred consists of three major phases.

```text
Phase 1
(Current MVP)

Centralized Platform

↓

Phase 2

Hybrid Architecture

↓

Phase 3

Distributed Trust Network

```

Each phase builds upon the previous one while maintaining backward compatibility.

# 35. Phase 1 – Centralized Architecture (Current MVP)

The current implementation consists of:

- Three React applications
- Centralized Node.js backend
- PostgreSQL database
- RSA Digital Signature Engine
- Trust Registry
- Secure Key Vault
- Audit Logging
- Verification Engine

```text
          React Applications
                  │
                  ▼
        Node.js + Express API
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
 PostgreSQL Database    Crypto Engine

```

This architecture is appropriate for:

- University pilot deployments
- Academic research
- Final year project implementation
- Small to medium scale institutions

# 36. Phase 2 – Hybrid Architecture

As more universities adopt the platform, several components can be separated into dedicated services.

Examples include:

- Notification Service
- Verification Service
- Audit Service
- CSV Processing Service
- Analytics Service

Instead of one large backend, specialized services communicate through secure APIs.

```text
               API Gateway
                    │
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
 Authentication  Verification  Notifications
      │             │             │
      └─────────────┼─────────────┘
                    ▼
              PostgreSQL

```

This modular approach improves maintainability and allows independent scaling of frequently used services.

# 37. Phase 3 – Permissioned Blockchain Integration

## Purpose

The current MVP stores credential records in a centralized PostgreSQL database.

Although secure, a centralized database represents a single administrative authority.

To further strengthen trust and auditability, future versions of EthioCred may integrate a permissioned blockchain network.

The blockchain will **not replace** the PostgreSQL database.

Instead, it will serve as an immutable integrity ledger.

## Why Blockchain?

Blockchain is introduced to enhance:

- Data integrity
- Transparency
- Tamper detection
- Distributed trust
- Long-term auditability

The goal is not to store complete academic records on-chain.

Instead, only cryptographic proofs of issued credentials are stored.

## Blockchain Architecture

```text
                    Credential Issued
                           │
                           ▼
                  SHA-256 Hash Generated
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
      PostgreSQL Database      Permissioned Blockchain
             │                           │
     Full Credential Record      Credential Hash
                                 Timestamp
                                 Issuer ID
                                 Transaction ID

```

The database continues storing complete credential information.

The blockchain stores immutable cryptographic evidence that the credential existed at a specific point in time.

# 38. Distributed Verification

Future blockchain integration enables multiple trusted organizations to maintain synchronized copies of credential integrity records.

Potential participants include:

- Addis Ababa University
- Bahir Dar University
- Adama Science and Technology University
- Ministry of Education
- EthioCred Administration

Each participant maintains a blockchain node.

```text
          Permissioned Blockchain

       ┌────────────┐
       │ AAU Node   │
       └─────┬──────┘
             │
 ┌───────────┼───────────┐
 ▼           ▼           ▼
MoE Node   ASTU Node   BDU Node
             │
             ▼
     EthioCred Node

```

Every node stores identical copies of the blockchain ledger.

Any unauthorized modification becomes immediately detectable because the altered record no longer matches the copies maintained by other participating nodes.

# 39. Tamper Detection Through Distributed Consensus

One of the primary motivations for introducing blockchain is enhanced tamper detection.

Suppose an attacker successfully compromises the central database and modifies a student's GPA.

Although the PostgreSQL record has changed, the corresponding blockchain hash remains unchanged.

During verification:

1. The backend recalculates the credential hash.
2. The blockchain record is retrieved.
3. The two hashes are compared.
4. Any mismatch indicates unauthorized modification.

```text
Database Hash

≠

Blockchain Hash

↓

Integrity Violation

↓

Verification Failed

```

This provides an additional layer of protection beyond RSA digital signatures.

# 40. Key Rotation Strategy

As institutions continue issuing credentials over many years, cryptographic keys will eventually require replacement.

Future versions of EthioCred will support:

- Key expiration
- Scheduled rotation
- Historical key archive
- Compromised key tracking
- Key versioning

```text
Institution

├── Key v1 (Archived)

├── Key v2 (Compromised)

└── Key v3 (Active)

```

Historical credentials remain verifiable using archived public keys.

New credentials are issued only with the active key.

# 41. External System Integration

Future versions of EthioCred may integrate directly with university Student Information Systems (SIS).

Instead of manually uploading CSV files, graduation records can be transferred automatically through secure APIs.

```text
University SIS

↓

REST API

↓

EthioCred

↓

Automatic Issuance

```

This reduces manual work while minimizing human error.

# 42. Fayda Integration

The MVP simulates identity verification using Fayda identifiers.

A production implementation may integrate with the official Fayda identity platform.

Potential capabilities include:

- Real identity verification
- Single Sign-On (SSO)
- Multi-factor authentication
- Biometric verification
- Secure identity assertions

This would strengthen user authentication while reducing identity fraud.

# 43. Mobile Wallet

Future releases may introduce a dedicated mobile application.

Potential features include:

- Secure credential storage
- QR code generation
- Push notifications
- Offline credential viewing
- Biometric authentication
- Credential sharing

The mobile wallet would consume the same backend APIs as the web applications.

# 44. High Availability and Disaster Recovery

To support nationwide deployment, future versions should incorporate high availability mechanisms.

Examples include:

- Database replication
- Automated backups
- Load balancing
- Multiple backend instances
- Health monitoring
- Disaster recovery planning

These improvements increase system resilience while reducing service interruptions.

# 45. Scalability Considerations

EthioCred has been designed to support future growth without major architectural redesign.

Potential scalability improvements include:

- Horizontal backend scaling
- Background job queues for batch issuance
- Redis caching
- API Gateway
- Containerized deployment using Docker
- Kubernetes orchestration
- Distributed verification nodes

Each enhancement can be introduced incrementally as system adoption increases.

# 46. Architectural Roadmap Summary

The long-term evolution of EthioCred follows a progressive modernization strategy.


| Phase   | Characteristics                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------ |
| Phase 1 | Centralized MVP using PostgreSQL and RSA cryptography                                            |
| Phase 2 | Modular backend services with improved scalability                                               |
| Phase 3 | Permissioned blockchain for distributed integrity verification                                   |
| Phase 4 | National-scale digital credential infrastructure with automated university and Fayda integration |


This roadmap ensures that the MVP remains practical for implementation while providing a clear path toward a secure, scalable, and nationally deployable academic credential verification ecosystem.

# 47. Conclusion

The architecture of EthioCred has been intentionally designed to balance simplicity, security, and extensibility.

The MVP focuses on delivering a robust centralized platform that demonstrates the practical application of cryptographic trust, digital signatures, secure identity mapping, and automated verification.

At the same time, the architecture lays the foundation for future enhancements such as permissioned blockchain, distributed verification nodes, real Fayda integration, and automated institutional connectivity.

By separating long-term architectural goals from the current implementation, EthioCred remains both achievable as a final-year project and scalable as a real-world digital credential infrastructure.