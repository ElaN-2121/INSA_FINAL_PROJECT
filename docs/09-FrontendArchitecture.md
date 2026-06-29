# EthioCred Frontend Architecture

**Document Version:** 1.0

# 1. Introduction

The EthioCred frontend provides the user interface through which students, universities, employers, and administrators interact with the platform.

Unlike the backend, which performs all business logic and cryptographic operations, the frontend focuses on presenting information, collecting user input, and securely communicating with the backend through RESTful APIs.

The frontend follows a component-based architecture using React, allowing reusable UI components, efficient state management, and clear separation of responsibilities.

# 2. Objectives

The frontend is responsible for:

- Providing intuitive user interfaces.
- Displaying academic credentials.
- Allowing credential issuance.
- Managing verification requests.
- Supporting credential verification.
- Enforcing role-based navigation.
- Communicating securely with the backend.

All sensitive operations are performed by the backend.

# 3. Technology Stack


| Component        | Technology                 |
| ---------------- | -------------------------- |
| Framework        | React                      |
| Routing          | React Router               |
| HTTP Client      | Axios                      |
| Styling          | CSS Modules / Tailwind CSS |
| State Management | React Context API          |
| Icons            | Lucide React               |
| Build Tool       | Vite                       |


# 4. Frontend Applications

EthioCred consists of three independent React applications.

### University Portal

Functions:

- Registrar login
- CSV upload
- Staging dashboard
- Batch credential issuance
- Credential revocation
- Issuance history

### User Wallet

Functions:

- Fayda login
- View credentials
- View credential details
- Approve employer requests
- Deny employer requests

### Employer Portal

Functions:

- Employer login
- Search credential
- Submit verification request
- View verification result
- Download verification report

# 5. Frontend Architecture

```text
React Components

↓

Pages

↓

Context API

↓

Axios Service

↓

REST API

↓

Node.js Backend

```

The frontend remains lightweight by delegating all business logic and cryptographic operations to the backend.

# 6. Security

The frontend follows several security practices:

- Store JWT securely
- Use HTTPS for all API requests
- Never expose private keys
- Never perform cryptographic signing
- Validate forms before submission
- Restrict navigation based on user roles

# 7. Summary

The EthioCred frontend provides responsive, role-specific interfaces for students, universities, and employers while delegating authentication, authorization, cryptography, and verification to the backend. This separation keeps the client lightweight, secure, and maintainable.

# 8. Folder Structure

```text
frontend/

src/

├── assets/

├── components/

├── pages/

├── layouts/

├── context/

├── services/

├── hooks/

├── utils/

├── App.jsx

└── main.jsx

```

Each application follows the same folder organization for consistency.

# 9. Routing

Each frontend defines protected routes based on user roles.

Example:

```text
/

↓

Login

↓

Dashboard

↓

Wallet / University / Employer

↓

Credential Pages

↓

Logout

```

Unauthorized users are redirected to the login page.

# 10. Communication with Backend

Every frontend communicates exclusively with the backend through REST APIs.

```text
React

↓

Axios

↓

HTTPS

↓

Express Backend

↓

PostgreSQL

```

The frontend never accesses the database directly.

# 11. Component Design

Reusable components include:

- Navigation Bar
- Sidebar
- Credential Card
- Verification Status Badge
- Modal Dialog
- Data Table
- CSV Upload Component
- QR Code Viewer
- Notification Toast

These reusable components ensure a consistent user experience across all applications.

# 12. User Experience

The interface is designed around simplicity and clarity.

Key principles include:

- Clean dashboard layouts
- Responsive design
- Accessible navigation
- Immediate feedback for user actions
- Clear verification status indicators
- Consistent branding across all portals

# 13. Future Enhancements

Future improvements may include:

- Progressive Web App (PWA) support
- Offline credential viewing
- Dark mode
- Multi-language support
- Push notifications
- QR code scanning
- Real-time verification updates

# 14. Summary

The EthioCred frontend provides a modular, responsive, and role-based user experience that complements the backend architecture. By separating presentation from business logic and relying on secure API communication, the frontend remains scalable, maintainable, and ready for future enhancements while delivering an intuitive experience for students, universities, and employers.