const CACHE_KEY = 'ethiocred_verification_results';

export function getVerificationResults() {
  try {
    return JSON.parse(sessionStorage.getItem(CACHE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveVerificationResult(result, credentialPreview) {
  const entry = {
    id: `${result.credential?.id || credentialPreview?.id}-${Date.now()}`,
    credentialId: result.credential?.id || credentialPreview?.id,
    serial_number: result.credential?.serial_number || credentialPreview?.serial_number,
    holder_name: result.credential?.holder_name || credentialPreview?.holder_name,
    institution_name: result.credential?.institution_name || credentialPreview?.institution_name,
    valid: result.valid,
    reason: result.reason,
    step: result.step,
    verifiedAt: new Date().toISOString(),
    credential: result.credential || credentialPreview,
  };
  const existing = getVerificationResults();
  existing.unshift(entry);
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(existing.slice(0, 100)));
  return entry;
}
