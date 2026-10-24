-- Migration: indexes referenced by repository query patterns

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_credential_id ON verification_logs(credential_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_credential_id ON verification_requests(credential_id);
CREATE INDEX IF NOT EXISTS idx_csv_batches_institution_id ON csv_batches(institution_id);
CREATE INDEX IF NOT EXISTS idx_revoked_credentials_credential_id ON revoked_credentials(credential_id);
