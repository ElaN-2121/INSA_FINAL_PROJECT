# EthioCred – Folder Structure

**Document Version:** 1.0

# 1. Purpose

This document defines the official directory structure for the EthioCred project.

A consistent folder structure improves:

- Maintainability
- Scalability
- Team collaboration
- Code readability
- Cursor AI code generation
- Testing
- Deployment

Every team member should follow this structure when creating new files or modules.

# 2. Repository Structure

The entire project is organized as a monorepo.

```text
ethiocred/
│
├── apps/
│
├── backend/
│
├── docs/
│
├── packages/
│
├── database/
│
├── scripts/
│
├── .github/
│
├── .vscode/
│
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── docker-compose.yml

```

# 3. Root Directory

## apps/

Contains all frontend applications.

```text
apps/

├── user-wallet/
├── university-portal/
└── employer-portal/

```

Each application is completely independent but consumes the same backend API.

## backend/

Contains the Express backend.

Responsible for:

- Authentication
- Database
- APIs
- Cryptography
- Verification
- CSV processing
- Notifications

## database/

Contains database-related resources.

```text
database/

├── migrations/
├── schema.sql
├── seed.sql
└── backup/

```

## docs/

Contains all project documentation.

```text
docs/

├── 01-ProjectOverview.md
├── 02-SystemArchitecture.md
├── 03-FolderStructure.md
├── 04-DatabaseDesign.md
├── 05-APIReference.md
├── 06-Authentication.md
├── 07-Cryptography.md
├── 08-BlockchainFuture.md
├── 09-FrontendArchitecture.md
├── 10-BackendArchitecture.md
├── 11-CodingStandards.md
├── 12-GitWorkflow.md
├── 13-DevelopmentRoadmap.md
├── 14-TestingStrategy.md
├── 15-Deployment.md
├── 16-SecurityValidationSuite.md
├── 17-DataFlow.md
└── CursorRules.md

```

## packages/

Shared code used by multiple applications.

```text
packages/

├── ui/
├── utils/
├── constants/
├── hooks/
└── types/

```

Examples:

- Button components
- Modal components
- Custom hooks
- Shared TypeScript types (if adopted later)
- Validation utilities

## scripts/

Automation scripts.

```text
scripts/

create-admin.js

generate-rsa-keys.js

seed-database.js

backup-db.js

```

# 4. Frontend Folder Structure

Each React application follows exactly the same architecture.

Example:

```text
apps/

user-wallet/

├── public/

├── src/

├── package.json

├── vite.config.js

└── README.md

```

# 5. src Folder

```text
src/

├── assets/

├── components/

├── layouts/

├── pages/

├── services/

├── hooks/

├── context/

├── utils/

├── routes/

├── styles/

├── constants/

├── App.jsx

└── main.jsx

```

# 6. assets/

Stores static resources.

```text
assets/

images/

icons/

logos/

fonts/

```

# 7. components/

Reusable UI components.

```text
components/

Button/

Card/

Navbar/

Sidebar/

Modal/

Table/

Input/

Loader/

Badge/

ProtectedRoute/

QRCode/

```

Components should be reusable and independent.

# 8. layouts/

Application layouts.

Examples:

```text
layouts/

DashboardLayout.jsx

AuthLayout.jsx

BlankLayout.jsx

```

Layouts define shared page structures.

# 9. pages/

Contains page-level components.

Example (User Wallet):

```text
pages/

Login/

Dashboard/

CredentialDetails/

VerificationRequests/

Notifications/

Settings/

Profile/

```

Example (University Portal):

```text
pages/

Dashboard/

UploadBatch/

IssueCredentials/

IssuedCredentials/

RevokedCredentials/

Reports/

Settings/

```

Example (Employer Portal):

```text
pages/

Dashboard/

VerifyCredential/

VerificationHistory/

RequestStatus/

Profile/

```

# 10. services/

Contains API communication.

Example:

```text
services/

authService.js

credentialService.js

institutionService.js

verificationService.js

notificationService.js

```

No API calls should be written directly inside React components.

# 11. hooks/

Reusable custom React hooks.

Examples:

```text
hooks/

useAuth.js

useFetch.js

useNotification.js

usePagination.js

```

# 12. context/

Global application state.

```text
context/

AuthContext.jsx

NotificationContext.jsx

ThemeContext.jsx

```

# 13. utils/

Utility functions.

Examples:

```text
utils/

formatDate.js

downloadFile.js

generateQRCode.js

validators.js

```

# 14. routes/

Application routing.

```text
routes/

index.jsx

ProtectedRoute.jsx

RoleGuard.jsx

```

# 15. styles/

Global styling.

```text
styles/

globals.css

variables.css

animations.css

```

# 16. Backend Structure

```text
backend/

src/

├── config/

├── controllers/

├── middleware/

├── models/

├── routes/

├── services/

├── repositories/

├── crypto/

├── validators/

├── utils/

├── jobs/

├── logs/

├── app.js

└── server.js

```

# 17. config/

Application configuration.

```text
config/

database.js

jwt.js

env.js

cors.js

```

# 18. controllers/

Receive HTTP requests.

Example:

```text
controllers/

authController.js

credentialController.js

verificationController.js

institutionController.js

```

Controllers should contain minimal logic and delegate work to services.

# 19. services/

Business logic.

```text
services/

authService.js

credentialService.js

verificationService.js

csvService.js

auditService.js

notificationService.js

```

Services coordinate repositories, cryptography, and validation.

# 20. repositories/

Database access layer.

```text
repositories/

userRepository.js

credentialRepository.js

institutionRepository.js

verificationRepository.js

```

Repositories interact directly with PostgreSQL.

# 21. crypto/

Cryptographic operations.

```text
crypto/

sign.js

verify.js

hash.js

keyManager.js

```

This module centralizes all RSA and SHA-256 operations.

# 22. middleware/

Express middleware.

```text
middleware/

authenticate.js

authorize.js

validateRequest.js

errorHandler.js

logger.js

```

# 23. validators/

Request validation.

```text
validators/

authValidator.js

credentialValidator.js

verificationValidator.js

```

# 24. jobs/

Background tasks.

Future examples:

```text
jobs/

emailNotifications.js

cleanupExpiredRequests.js

dailyReports.js

```

# 25. logs/

Application logs.

```text
logs/

access.log

error.log

audit.log

```

In production, logs should be rotated automatically.

# 26. Naming Conventions


| Item         | Convention | Example                 |
| ------------ | ---------- | ----------------------- |
| Components   | PascalCase | DashboardCard.jsx       |
| Hooks        | camelCase  | useAuth.js              |
| Services     | camelCase  | authService.js          |
| Controllers  | camelCase  | credentialController.js |
| Repositories | camelCase  | userRepository.js       |
| Routes       | camelCase  | authRoutes.js           |
| CSS          | kebab-case | dashboard-layout.css    |


---

# 27. Architectural Rules

To maintain consistency across the project, the following rules must always be followed:

1. Components must never communicate directly with the database.
2. All frontend communication must go through the REST API.
3. Controllers must never contain business logic.
4. Business logic belongs in the service layer.
5. Cryptographic operations must be isolated inside the `crypto/` module.
6. Database queries belong only in repositories.
7. Every API endpoint must validate incoming requests.
8. Sensitive configuration values must be stored in environment variables.
9. Shared code should be placed in the `packages/` directory whenever practical.
10. Documentation should be updated whenever the architecture changes.

# 28. Conclusion

This folder structure establishes a scalable and maintainable foundation for the EthioCred platform.

By separating presentation, business logic, cryptographic operations, and data access into clearly defined modules, the project becomes easier to develop collaboratively, easier to test, and easier to extend as new features are introduced.

Following this structure consistently will reduce technical debt, improve onboarding for new contributors, and provide Cursor AI with a predictable project layout for generating accurate and maintainable code.