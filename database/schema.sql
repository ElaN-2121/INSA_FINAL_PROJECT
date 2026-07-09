-- EthioCred Database Schema
-- PostgreSQL 16+

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Table 1: institutions (created before users to resolve FK ordering)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    organization_fayda_id VARCHAR(50) UNIQUE,
    registration_number VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'ACTIVE', 'SUSPENDED', 'REVOKED')),
    approved_by UUID,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Table 2: users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    fayda_id VARCHAR(50) UNIQUE,
    role VARCHAR(30) NOT NULL
        CHECK (role IN ('ADMIN', 'UNIVERSITY', 'STUDENT', 'EMPLOYER')),
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);

ALTER TABLE institutions
    DROP CONSTRAINT IF EXISTS fk_institutions_approved_by;

ALTER TABLE institutions
    ADD CONSTRAINT fk_institutions_approved_by
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Table 3: institution_keys
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS institution_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    public_key TEXT NOT NULL,
    private_key_encrypted TEXT NOT NULL,
    key_version INTEGER DEFAULT 1,
    fingerprint VARCHAR(128) UNIQUE,
    status VARCHAR(20) DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'ARCHIVED', 'COMPROMISED', 'REVOKED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Table 4: credentials
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    holder_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
    credential_type VARCHAR(100) DEFAULT 'DEGREE',
    degree_name VARCHAR(255) NOT NULL,
    major VARCHAR(255),
    graduation_year INTEGER NOT NULL,
    gpa DECIMAL(3, 2),
    issue_date DATE NOT NULL,
    credential_hash TEXT NOT NULL,
    digital_signature TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'REVOKED')),
    issued_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Table 5: verification_requests
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'DENIED', 'COMPLETED')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Table 6: verification_logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES verification_requests(id) ON DELETE SET NULL,
    credential_id UUID REFERENCES credentials(id) ON DELETE SET NULL,
    result VARCHAR(30) NOT NULL
        CHECK (result IN ('VALID', 'INVALID', 'REVOKED', 'UNTRUSTED', 'NOT_FOUND', 'INTEGRITY_VIOLATION')),
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details JSONB
);

-- ---------------------------------------------------------------------------
-- Table 7: revoked_credentials
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS revoked_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
    revoked_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason TEXT,
    revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Table 8: notifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Table 9: audit_logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    ip_address VARCHAR(45),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Table 10: csv_batches
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS csv_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    filename VARCHAR(255),
    file_data JSONB,
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'STAGED', 'ISSUED', 'FAILED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Table 11: credential_share_links
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credential_share_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    max_views INTEGER DEFAULT NULL CHECK (max_views IS NULL OR max_views > 0),
    view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Table 12: institution_api_keys
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS institution_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix VARCHAR(12) NOT NULL,
    label VARCHAR(100),
    last_used_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_credentials_holder_id ON credentials(holder_id);
CREATE INDEX IF NOT EXISTS idx_credentials_institution_id ON credentials(institution_id);
CREATE INDEX IF NOT EXISTS idx_credentials_serial_number ON credentials(serial_number);
CREATE INDEX IF NOT EXISTS idx_verification_requests_employer_id ON verification_requests(employer_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_student_id ON verification_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_credential_id ON verification_requests(credential_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_credential_id ON verification_logs(credential_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_csv_batches_institution_id ON csv_batches(institution_id);
CREATE INDEX IF NOT EXISTS idx_revoked_credentials_credential_id ON revoked_credentials(credential_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_share_links_token ON credential_share_links(token);
CREATE INDEX IF NOT EXISTS idx_share_links_credential_id ON credential_share_links(credential_id);
CREATE INDEX IF NOT EXISTS idx_share_links_student_id ON credential_share_links(student_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_institution ON institution_api_keys(institution_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON institution_api_keys(key_hash);
