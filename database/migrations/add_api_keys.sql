CREATE TABLE IF NOT EXISTS institution_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix VARCHAR(12) NOT NULL,
  label VARCHAR(100),
  last_used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_api_keys_institution ON institution_api_keys(institution_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON institution_api_keys(key_hash);
