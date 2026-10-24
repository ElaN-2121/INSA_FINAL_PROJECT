-- ============================================================================
-- EthioCred Analytics Demo Seed Data (DEVELOPMENT ONLY)
-- ============================================================================
-- WARNING: This script seeds realistic verification requests, verification logs,
-- and cross-institution candidate analytics for demonstration purposes.
-- It is strictly intended for local development and UI demonstrations.
-- NEVER run this script in production environments.
--
-- HOW TO RUN:
-- Option 1 (NPM script):
--   npm run seed:analytics-demo
--
-- Option 2 (Node runner):
--   node scripts/seed-analytics-demo.js
--
-- Option 3 (Direct psql):
--   psql -U postgres -d ethiocred -f database/seed-analytics-demo.sql
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Ensure Institutions Exist
-- ---------------------------------------------------------------------------
-- AAU (Addis Ababa University - default seed)
INSERT INTO institutions (id, name, organization_fayda_id, registration_number, status, approved_at)
VALUES (
    'b0000000-0000-4000-8000-000000000001',
    'Addis Ababa University',
    'ORG-000001',
    'MOE-ET-2025-001',
    'ACTIVE',
    CURRENT_TIMESTAMP
) ON CONFLICT (registration_number) DO UPDATE SET name = EXCLUDED.name, status = 'ACTIVE';

-- Hawassa University (Demo secondary institution)
INSERT INTO institutions (id, name, organization_fayda_id, registration_number, status, approved_at)
VALUES (
    'b0000000-0000-4000-8000-000000000003',
    'Hawassa University',
    'ORG-DEMO-HAW-003',
    'MOE-ET-DEMO-HAW-003',
    'ACTIVE',
    CURRENT_TIMESTAMP
) ON CONFLICT (registration_number) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Ensure Employers with Verified Company Names
-- ---------------------------------------------------------------------------
-- Primary Employer: Ethio Telecom (matches default login employer@company.com)
UPDATE users 
SET company_name = 'Ethio Telecom' 
WHERE id = 'e0000000-0000-4000-8000-000000000001';

-- Secondary Employer: Commercial Bank of Ethiopia (recruitment@cbe.com.et)
INSERT INTO users (id, full_name, email, password_hash, role, company_name, status)
VALUES (
    'e0000000-0000-4000-8000-000000000002',
    'Talent Acquisition Lead',
    'recruitment@cbe.com.et',
    '$2b$12$eXAMP1eHashForEmployerPasswordNotActuallyCheckedIfOverwritten123',
    'EMPLOYER',
    'Commercial Bank of Ethiopia',
    'ACTIVE'
) ON CONFLICT (email) DO UPDATE SET company_name = EXCLUDED.company_name;

-- Tertiary Employer: Safaricom Ethiopia (careers@safaricom.et)
INSERT INTO users (id, full_name, email, password_hash, role, company_name, status)
VALUES (
    'e0000000-0000-4000-8000-000000000003',
    'Recruiting Officer',
    'careers@safaricom.et',
    '$2b$12$eXAMP1eHashForEmployerPasswordNotActuallyCheckedIfOverwritten123',
    'EMPLOYER',
    'Safaricom Ethiopia',
    'ACTIVE'
) ON CONFLICT (email) DO UPDATE SET company_name = EXCLUDED.company_name;

-- Quaternary Employer: Ministry of Innovation & Technology (jobs@mint.gov.et)
INSERT INTO users (id, full_name, email, password_hash, role, company_name, status)
VALUES (
    'e0000000-0000-4000-8000-000000000004',
    'Civil Service Director',
    'jobs@mint.gov.et',
    '$2b$12$eXAMP1eHashForEmployerPasswordNotActuallyCheckedIfOverwritten123',
    'EMPLOYER',
    'Ministry of Innovation & Technology',
    'ACTIVE'
) ON CONFLICT (email) DO UPDATE SET company_name = EXCLUDED.company_name;

-- ---------------------------------------------------------------------------
-- 3. Demo Students
-- ---------------------------------------------------------------------------
-- Primary Student is student@example.com (id: d0000000-0000-4000-8000-000000000001)
-- Additional demo students with unique demo fayda IDs:
INSERT INTO users (id, full_name, email, password_hash, fayda_id, role, status)
VALUES
    ('d0000000-0000-4000-8000-000000000002', 'Tigist Alemu', 'tigist.demo@ethiocred.et', '$2b$12$eXAMP1eHash2', 'FAYDA-DEMO-002', 'STUDENT', 'ACTIVE'),
    ('d0000000-0000-4000-8000-000000000003', 'Dawit Tadesse', 'dawit.demo@ethiocred.et', '$2b$12$eXAMP1eHash3', 'FAYDA-DEMO-003', 'STUDENT', 'ACTIVE'),
    ('d0000000-0000-4000-8000-000000000004', 'Marta Haile', 'marta.demo@ethiocred.et', '$2b$12$eXAMP1eHash4', 'FAYDA-DEMO-004', 'STUDENT', 'ACTIVE'),
    ('d0000000-0000-4000-8000-000000000005', 'Yonas Bekele', 'yonas.demo@ethiocred.et', '$2b$12$eXAMP1eHash5', 'FAYDA-DEMO-005', 'STUDENT', 'ACTIVE'),
    ('d0000000-0000-4000-8000-000000000006', 'Hemen Solomon', 'hemen.demo@ethiocred.et', '$2b$12$eXAMP1eHash6', 'FAYDA-DEMO-006', 'STUDENT', 'ACTIVE'),
    ('d0000000-0000-4000-8000-000000000007', 'Biruk Tadesse', 'biruk.demo@ethiocred.et', '$2b$12$eXAMP1eHash7', 'FAYDA-DEMO-007', 'STUDENT', 'ACTIVE'),
    ('d0000000-0000-4000-8000-000000000008', 'Sara Kebede', 'sara.demo@ethiocred.et', '$2b$12$eXAMP1eHash8', 'FAYDA-DEMO-008', 'STUDENT', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. Demo Academic Credentials (AAU & Hawassa across departments)
-- ---------------------------------------------------------------------------
INSERT INTO credentials (id, serial_number, holder_id, institution_id, credential_type, degree_name, major, graduation_year, gpa, issue_date, credential_hash, digital_signature, status, issued_by)
VALUES
    -- AAU Computer Science
    ('c0000000-0000-4000-a000-000000000001', 'DEMO-AAU-CS-001', 'd0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'DEGREE', 'Bachelor of Science', 'Computer Science', 2025, 3.85, '2025-07-15', 'DEMO_HASH_CS1', 'DEMO_SIG_CS1', 'ACTIVE', 'c0000000-0000-4000-8000-000000000001'),
    ('c0000000-0000-4000-a000-000000000002', 'DEMO-AAU-CS-002', 'd0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'DEGREE', 'Bachelor of Science', 'Computer Science', 2025, 3.92, '2025-07-15', 'DEMO_HASH_CS2', 'DEMO_SIG_CS2', 'ACTIVE', 'c0000000-0000-4000-8000-000000000001'),
    ('c0000000-0000-4000-a000-000000000003', 'DEMO-AAU-CS-003', 'd0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'DEGREE', 'Bachelor of Science', 'Computer Science', 2024, 3.70, '2024-07-20', 'DEMO_HASH_CS3', 'DEMO_SIG_CS3', 'ACTIVE', 'c0000000-0000-4000-8000-000000000001'),

    -- AAU Software Engineering
    ('c0000000-0000-4000-a000-000000000004', 'DEMO-AAU-SE-001', 'd0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'DEGREE', 'Bachelor of Science', 'Software Engineering', 2025, 3.78, '2025-07-15', 'DEMO_HASH_SE1', 'DEMO_SIG_SE1', 'ACTIVE', 'c0000000-0000-4000-8000-000000000001'),
    ('c0000000-0000-4000-a000-000000000005', 'DEMO-AAU-SE-002', 'd0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', 'DEGREE', 'Bachelor of Science', 'Software Engineering', 2025, 3.65, '2025-07-15', 'DEMO_HASH_SE2', 'DEMO_SIG_SE2', 'ACTIVE', 'c0000000-0000-4000-8000-000000000001'),

    -- AAU Electrical Engineering
    ('c0000000-0000-4000-a000-000000000006', 'DEMO-AAU-EE-001', 'd0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', 'DEGREE', 'Bachelor of Engineering', 'Electrical Engineering', 2024, 3.45, '2024-07-10', 'DEMO_HASH_EE1', 'DEMO_SIG_EE1', 'ACTIVE', 'c0000000-0000-4000-8000-000000000001'),
    ('c0000000-0000-4000-a000-000000000007', 'DEMO-AAU-EE-002', 'd0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000001', 'DEGREE', 'Bachelor of Engineering', 'Electrical Engineering', 2025, 3.52, '2025-07-15', 'DEMO_HASH_EE2', 'DEMO_SIG_EE2', 'ACTIVE', 'c0000000-0000-4000-8000-000000000001'),

    -- AAU Information Technology
    ('c0000000-0000-4000-a000-000000000008', 'DEMO-AAU-IT-001', 'd0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000001', 'DEGREE', 'Bachelor of Science', 'Information Technology', 2025, 3.60, '2025-07-15', 'DEMO_HASH_IT1', 'DEMO_SIG_IT1', 'ACTIVE', 'c0000000-0000-4000-8000-000000000001'),

    -- AAU Economics
    ('c0000000-0000-4000-a000-000000000009', 'DEMO-AAU-EC-001', 'd0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'DEGREE', 'Bachelor of Arts', 'Economics', 2023, 3.90, '2023-07-10', 'DEMO_HASH_EC1', 'DEMO_SIG_EC1', 'ACTIVE', 'c0000000-0000-4000-8000-000000000001'),

    -- AAU Data Science
    ('c0000000-0000-4000-a000-000000000010', 'DEMO-AAU-DS-001', 'd0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'DEGREE', 'Master of Science', 'Data Science', 2025, 3.95, '2025-07-20', 'DEMO_HASH_DS1', 'DEMO_SIG_DS1', 'ACTIVE', 'c0000000-0000-4000-8000-000000000001'),

    -- AAU Civil Engineering (Low count to test <3 differential privacy threshold)
    ('c0000000-0000-4000-a000-000000000011', 'DEMO-AAU-CE-001', 'd0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'DEGREE', 'Bachelor of Science', 'Civil Engineering', 2024, 3.25, '2024-07-12', 'DEMO_HASH_CE1', 'DEMO_SIG_CE1', 'ACTIVE', 'c0000000-0000-4000-8000-000000000001'),

    -- Hawassa University Credentials (institution: b0000000-0000-4000-8000-000000000003)
    ('c0000000-0000-4000-a000-000000000015', 'DEMO-HAW-CS-001', 'd0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000003', 'DEGREE', 'Bachelor of Science', 'Computer Science', 2025, 3.68, '2025-07-14', 'DEMO_HASH_HAW1', 'DEMO_SIG_HAW1', 'ACTIVE', NULL),
    ('c0000000-0000-4000-a000-000000000016', 'DEMO-HAW-EC-001', 'd0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000003', 'DEGREE', 'Bachelor of Arts', 'Economics', 2025, 3.72, '2025-07-14', 'DEMO_HASH_HAW2', 'DEMO_SIG_HAW2', 'ACTIVE', NULL)
ON CONFLICT (serial_number) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5. Verification Requests Across Months (May - October 2026)
-- ---------------------------------------------------------------------------
INSERT INTO verification_requests (id, credential_id, employer_id, student_id, status, requested_at, responded_at, expires_at)
VALUES
    -- May 2026 Requests
    ('fa000000-0000-4000-0001-000000000001', 'c0000000-0000-4000-a000-000000000003', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000003', 'APPROVED', '2026-05-04 09:30:00', '2026-05-04 11:15:00', '2026-06-04 09:30:00'),
    ('fa000000-0000-4000-0001-000000000002', 'c0000000-0000-4000-a000-000000000006', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000006', 'APPROVED', '2026-05-12 14:00:00', '2026-05-13 09:00:00', '2026-06-12 14:00:00'),
    ('fa000000-0000-4000-0001-000000000003', 'c0000000-0000-4000-a000-000000000006', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000006', 'DENIED',   '2026-05-18 10:15:00', '2026-05-18 16:45:00', '2026-06-18 10:15:00'),

    -- June 2026 Requests
    ('fa000000-0000-4000-0001-000000000004', 'c0000000-0000-4000-a000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'APPROVED', '2026-06-02 11:00:00', '2026-06-02 11:35:00', '2026-07-02 11:00:00'),
    ('fa000000-0000-4000-0001-000000000005', 'c0000000-0000-4000-a000-000000000004', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000004', 'APPROVED', '2026-06-10 15:20:00', '2026-06-11 08:45:00', '2026-07-10 15:20:00'),
    ('fa000000-0000-4000-0001-000000000006', 'c0000000-0000-4000-a000-000000000009', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'APPROVED', '2026-06-21 16:00:00', '2026-06-22 10:10:00', '2026-07-21 16:00:00'),

    -- July 2026 Requests
    ('fa000000-0000-4000-0001-000000000008', 'c0000000-0000-4000-a000-000000000002', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'APPROVED', '2026-07-05 08:30:00', '2026-07-05 09:20:00', '2026-08-05 08:30:00'),
    ('fa000000-0000-4000-0001-000000000009', 'c0000000-0000-4000-a000-000000000005', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000005', 'APPROVED', '2026-07-12 11:45:00', '2026-07-12 14:10:00', '2026-08-12 11:45:00'),
    ('fa000000-0000-4000-0001-000000000010', 'c0000000-0000-4000-a000-000000000007', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000007', 'DENIED',   '2026-07-19 13:00:00', '2026-07-20 10:00:00', '2026-08-19 13:00:00'),

    -- August 2026 Requests
    ('fa000000-0000-4000-0001-000000000012', 'c0000000-0000-4000-a000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'APPROVED', '2026-08-03 09:00:00', '2026-08-03 09:18:00', '2026-09-03 09:00:00'),
    ('fa000000-0000-4000-0001-000000000013', 'c0000000-0000-4000-a000-000000000008', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000008', 'APPROVED', '2026-08-14 14:30:00', '2026-08-14 17:00:00', '2026-09-14 14:30:00'),
    ('fa000000-0000-4000-0001-000000000014', 'c0000000-0000-4000-a000-000000000010', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'APPROVED', '2026-08-20 10:15:00', '2026-08-21 08:30:00', '2026-09-20 10:15:00'),
    ('fa000000-0000-4000-0001-000000000015', 'c0000000-0000-4000-a000-000000000015', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000007', 'APPROVED', '2026-08-27 16:40:00', '2026-08-28 09:10:00', '2026-09-27 16:40:00'),

    -- September 2026 Requests
    ('fa000000-0000-4000-0001-000000000016', 'c0000000-0000-4000-a000-000000000002', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'APPROVED', '2026-09-02 10:00:00', '2026-09-02 10:45:00', '2026-10-02 10:00:00'),
    ('fa000000-0000-4000-0001-000000000017', 'c0000000-0000-4000-a000-000000000004', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000004', 'APPROVED', '2026-09-08 11:20:00', '2026-09-08 13:00:00', '2026-10-08 11:20:00'),
    ('fa000000-0000-4000-0001-000000000018', 'c0000000-0000-4000-a000-000000000016', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000008', 'APPROVED', '2026-09-15 09:30:00', '2026-09-15 11:00:00', '2026-10-15 09:30:00'),
    ('fa000000-0000-4000-0001-000000000019', 'c0000000-0000-4000-a000-000000000011', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000003', 'DENIED',   '2026-09-22 14:00:00', '2026-09-23 08:30:00', '2026-10-22 14:00:00'),

    -- October 2026 Requests
    ('fa000000-0000-4000-0001-000000000020', 'c0000000-0000-4000-a000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'APPROVED', '2026-10-02 08:15:00', '2026-10-02 08:42:00', '2026-11-02 08:15:00'),
    ('fa000000-0000-4000-0001-000000000021', 'c0000000-0000-4000-a000-000000000005', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000005', 'APPROVED', '2026-10-08 13:00:00', '2026-10-08 15:30:00', '2026-11-08 13:00:00'),
    ('fa000000-0000-4000-0001-000000000022', 'c0000000-0000-4000-a000-000000000003', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000003', 'PENDING',  '2026-10-21 10:00:00', NULL,                  '2026-11-21 10:00:00'),
    ('fa000000-0000-4000-0001-000000000023', 'c0000000-0000-4000-a000-000000000006', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000006', 'PENDING',  '2026-10-23 15:45:00', NULL,                  '2026-11-23 15:45:00'),

    -- Additional Requests from CBE to student@example.com (Abebe Kebede)
    ('fa000000-0000-4000-0002-000000000024', 'c0000000-0000-4000-a000-000000000001', 'e0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'APPROVED', '2026-08-10 10:00:00', '2026-08-10 10:30:00', '2026-09-10 10:00:00'),
    ('fa000000-0000-4000-0002-000000000025', 'c0000000-0000-4000-a000-000000000009', 'e0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'APPROVED', '2026-09-12 11:00:00', '2026-09-12 12:15:00', '2026-10-12 11:00:00'),
    -- Safaricom request to Abebe Kebede
    ('fa000000-0000-4000-0003-000000000026', 'c0000000-0000-4000-a000-000000000001', 'e0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 'PENDING',  '2026-10-22 09:15:00', NULL,                  '2026-11-22 09:15:00')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 6. Verification Logs Across Months & Departments
-- ---------------------------------------------------------------------------
INSERT INTO verification_logs (id, request_id, credential_id, result, checked_at, details)
VALUES
    -- MAY 2026 Verifications
    ('fb000000-0000-4000-0001-000000000001', 'fa000000-0000-4000-0001-000000000001', 'c0000000-0000-4000-a000-000000000003', 'VALID', '2026-05-04 11:20:00', '{"channel": "employer_portal", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000002', 'fa000000-0000-4000-0001-000000000002', 'c0000000-0000-4000-a000-000000000006', 'VALID', '2026-05-13 09:05:00', '{"channel": "employer_portal", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000003', NULL,                                   'c0000000-0000-4000-a000-000000000001', 'VALID', '2026-05-15 14:10:00', '{"channel": "qr_scan", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000004', NULL,                                   'c0000000-0000-4000-a000-000000000004', 'VALID', '2026-05-20 16:30:00', '{"channel": "qr_scan", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000005', NULL,                                   'c0000000-0000-4000-a000-000000000001', 'VALID', '2026-05-28 10:05:00', '{"channel": "public_registry", "demo": true}'),

    -- JUNE 2026 Verifications
    ('fb000000-0000-4000-0001-000000000006', 'fa000000-0000-4000-0001-000000000004', 'c0000000-0000-4000-a000-000000000001', 'VALID', '2026-06-02 11:40:00', '{"channel": "employer_portal", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000007', 'fa000000-0000-4000-0001-000000000005', 'c0000000-0000-4000-a000-000000000004', 'VALID', '2026-06-11 08:50:00', '{"channel": "employer_portal", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000008', NULL,                                   'c0000000-0000-4000-a000-000000000002', 'VALID', '2026-06-15 13:20:00', '{"channel": "qr_scan", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000009', 'fa000000-0000-4000-0001-000000000006', 'c0000000-0000-4000-a000-000000000009', 'VALID', '2026-06-22 10:15:00', '{"channel": "employer_portal", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000010', NULL,                                   'c0000000-0000-4000-a000-000000000005', 'VALID', '2026-06-27 15:00:00', '{"channel": "qr_scan", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000011', NULL,                                   'c0000000-0000-4000-a000-000000000007', 'INVALID', '2026-06-29 11:30:00', '{"channel": "public_registry", "reason": "expired_signature", "demo": true}'),

    -- JULY 2026 Verifications (High Volume - Graduation Season)
    ('fb000000-0000-4000-0001-000000000012', 'fa000000-0000-4000-0001-000000000008', 'c0000000-0000-4000-a000-000000000002', 'VALID', '2026-07-05 09:25:00', '{"channel": "employer_portal", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000013', 'fa000000-0000-4000-0001-000000000009', 'c0000000-0000-4000-a000-000000000005', 'VALID', '2026-07-12 14:15:00', '{"channel": "employer_portal", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000014', NULL,                                   'c0000000-0000-4000-a000-000000000001', 'VALID', '2026-07-14 10:00:00', '{"channel": "qr_scan", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000015', NULL,                                   'c0000000-0000-4000-a000-000000000004', 'VALID', '2026-07-18 16:20:00', '{"channel": "qr_scan", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000016', NULL,                                   'c0000000-0000-4000-a000-000000000008', 'VALID', '2026-07-22 11:10:00', '{"channel": "public_registry", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000017', NULL,                                   'c0000000-0000-4000-a000-000000000006', 'VALID', '2026-07-25 14:40:00', '{"channel": "qr_scan", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000018', NULL,                                   'c0000000-0000-4000-a000-000000000010', 'VALID', '2026-07-29 09:50:00', '{"channel": "employer_portal", "demo": true}'),

    -- AUGUST 2026 Verifications
    ('fb000000-0000-4000-0001-000000000019', 'fa000000-0000-4000-0001-000000000012', 'c0000000-0000-4000-a000-000000000001', 'VALID', '2026-08-03 09:25:00', '{"channel": "employer_portal", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000020', 'fa000000-0000-4000-0002-000000000024', 'c0000000-0000-4000-a000-000000000001', 'VALID', '2026-08-10 10:35:00', '{"channel": "employer_portal", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000021', 'fa000000-0000-4000-0001-000000000013', 'c0000000-0000-4000-a000-000000000008', 'VALID', '2026-08-14 17:05:00', '{"channel": "employer_portal", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000022', 'fa000000-0000-4000-0001-000000000014', 'c0000000-0000-4000-a000-000000000010', 'VALID', '2026-08-21 08:35:00', '{"channel": "employer_portal", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000023', NULL,                                   'c0000000-0000-4000-a000-000000000004', 'VALID', '2026-08-25 15:15:00', '{"channel": "qr_scan", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000024', NULL,                                   'c0000000-0000-4000-a000-000000000007', 'INTEGRITY_VIOLATION', '2026-08-29 11:00:00', '{"channel": "public_registry", "reason": "tampered_payload", "demo": true}'),

    -- SEPTEMBER 2026 Verifications
    ('fb000000-0000-4000-0001-000000000025', 'fa000000-0000-4000-0001-000000000016', 'c0000000-0000-4000-a000-000000000002', 'VALID', '2026-09-02 10:50:00', '{"channel": "employer_portal", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000026', 'fa000000-0000-4000-0001-000000000017', 'c0000000-0000-4000-a000-000000000004', 'VALID', '2026-09-08 13:05:00', '{"channel": "employer_portal", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000027', 'fa000000-0000-4000-0002-000000000025', 'c0000000-0000-4000-a000-000000000009', 'VALID', '2026-09-12 12:20:00', '{"channel": "employer_portal", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000028', NULL,                                   'c0000000-0000-4000-a000-000000000003', 'VALID', '2026-09-18 14:40:00', '{"channel": "qr_scan", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000029', NULL,                                   'c0000000-0000-4000-a000-000000000001', 'VALID', '2026-09-24 16:10:00', '{"channel": "public_registry", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000030', NULL,                                   'c0000000-0000-4000-a000-000000000005', 'VALID', '2026-09-28 10:25:00', '{"channel": "qr_scan", "demo": true}'),

    -- OCTOBER 2026 Verifications
    ('fb000000-0000-4000-0001-000000000031', 'fa000000-0000-4000-0001-000000000020', 'c0000000-0000-4000-a000-000000000001', 'VALID', '2026-10-02 08:45:00', '{"channel": "employer_portal", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000032', 'fa000000-0000-4000-0001-000000000021', 'c0000000-0000-4000-a000-000000000005', 'VALID', '2026-10-08 15:35:00', '{"channel": "employer_portal", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000033', NULL,                                   'c0000000-0000-4000-a000-000000000002', 'VALID', '2026-10-12 11:15:00', '{"channel": "qr_scan", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000034', NULL,                                   'c0000000-0000-4000-a000-000000000001', 'VALID', '2026-10-15 14:00:00', '{"channel": "public_registry", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000035', NULL,                                   'c0000000-0000-4000-a000-000000000004', 'VALID', '2026-10-19 16:50:00', '{"channel": "qr_scan", "demo": true}'),
    ('fb000000-0000-4000-0001-000000000036', NULL,                                   'c0000000-0000-4000-a000-000000000010', 'VALID', '2026-10-23 09:30:00', '{"channel": "employer_portal", "demo": true}')
ON CONFLICT (id) DO NOTHING;

COMMIT;
