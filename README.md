# EthioCred – Secure Digital Academic Credential Platform

## Quick Start

### 1. Install dependencies
npm install

### 2. Set up environment
cp .env.example backend/.env
# Edit backend/.env with your PostgreSQL password and other values

### 3. Set up database
psql -U postgres -d ethiocred -f database/schema.sql
node scripts/seed-database.js

### 4. Start the backend
cd backend && npm run dev

### 5. Start the frontend apps (each in a new terminal)
cd apps/user-wallet && npm run dev          # http://localhost:5173
cd apps/university-portal && npm run dev    # http://localhost:5174
cd apps/employer-portal && npm run dev      # http://localhost:5175

## Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ethiocred.et | Admin@123 |
| Registrar | registrar@aau.et | Registrar@123 |
| Student | student@example.com | Student@123 |
| Employer | employer@company.com | Employer@123 |

## Security Demo
Login as Admin, go to university portal → Admin → Security Demo

## Port Reference
- Backend: 5000
- User Wallet: 5173
- University Portal: 5174
- Employer Portal: 5175
