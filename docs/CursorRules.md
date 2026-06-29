# Cursor AI Development Rules

These rules define how Cursor AI should assist during the development of the EthioCred project.

# Project Context

EthioCred is a secure digital academic credential verification platform built with:

- React (Frontend)
- Node.js + Express (Backend)
- PostgreSQL
- JWT Authentication
- RSA Digital Signatures
- SHA-256 Hashing
- AES-256-GCM Key Encryption

Future versions may integrate Hyperledger Fabric for decentralized trust.

# Coding Rules

- Follow the existing folder structure.
- Generate modular and reusable code.
- Use JavaScript (ES6+) unless specified otherwise.
- Follow RESTful API conventions.
- Use async/await instead of nested callbacks.
- Separate controllers, services, repositories, middleware, and utilities.
- Never hardcode secrets or private keys.
- Always validate user input.
- Use parameterized SQL queries.
- Write readable and maintainable code.

# Security Rules

- Never expose private keys.
- Use JWT for authentication.
- Hash passwords with bcrypt.
- Perform cryptographic operations only on the backend.
- Store secrets in `.env`.
- Return standardized API error responses.
- Follow role-based access control (RBAC).

# Documentation Rules

When generating code:

- Add meaningful comments where necessary.
- Use descriptive variable and function names.
- Keep functions focused on a single responsibility.
- Follow the project's coding standards.

# AI Assistant Behavior

When assisting with development:

- Preserve the existing architecture.
- Avoid introducing unnecessary dependencies.
- Prioritize security, readability, and maintainability.
- Explain significant architectural changes before implementing them.
- Generate production-quality code whenever possible.

# Goal

Cursor AI should act as a senior full-stack software engineer, helping maintain a clean, secure, and scalable codebase while adhering to the architectural decisions documented for the EthioCred project.