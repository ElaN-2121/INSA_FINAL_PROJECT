-- Migration: credential_share_links
-- Shareable, time-limited credential verification links for students.

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

-- Backfill column when upgrading an older partial schema.
ALTER TABLE credential_share_links
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_share_links_token ON credential_share_links(token);
CREATE INDEX IF NOT EXISTS idx_share_links_credential_id ON credential_share_links(credential_id);
CREATE INDEX IF NOT EXISTS idx_share_links_student_id ON credential_share_links(student_id);
