import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { get, post, formatDate, formatDateTime } from '@ethiocred/utils';
import Loader from '../../components/Loader/Loader.jsx';
import { saveVerificationResult } from '../../utils/verificationCache.js';

const FAILURE_MESSAGES = {
  CREDENTIAL_NOT_FOUND: 'Credential does not exist in the system',
  UNTRUSTED_INSTITUTION: 'Issuing institution is not in the Trust Registry',
  NO_PUBLIC_KEY: 'Issuing institution is not in the Trust Registry',
  INTEGRITY_VIOLATION: 'Credential data has been tampered with',
  INVALID_SIGNATURE: 'Digital signature verification failed',
  CREDENTIAL_REVOKED: 'This credential has been revoked by the institution',
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function VerifyCredential() {
  const location = useLocation();
  const [searchInput, setSearchInput] = useState('');
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.credentialId) {
      setSearchInput(location.state.credentialId);
    }
  }, [location.state]);

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setSearching(true);
    setError('');
    setPreview(null);
    setResult(null);

    try {
      if (!UUID_REGEX.test(searchInput.trim())) {
        const histRes = await get('/verification/history');
        const hist = histRes.data.data || [];
        const match = hist.find(
          (h) => h.serial_number?.toLowerCase() === searchInput.trim().toLowerCase()
        );
        if (match?.credential_id) {
          const { data } = await get(`/credentials/${match.credential_id}`);
          setPreview(data.data);
          return;
        }
      }
      const { data } = await get(`/credentials/${searchInput.trim()}`);
      setPreview(data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Credential not found');
    } finally {
      setSearching(false);
    }
  };

  const handleVerify = async () => {
    if (!preview?.id) return;
    setVerifying(true);
    setError('');
    setResult(null);

    try {
      const { data } = await post(`/verification/verify/${preview.id}`);
      const verificationResult = data.data;
      setResult(verificationResult);
      saveVerificationResult(verificationResult, preview);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Verify Credential</h2>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Credential ID or Serial Number
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="UUID or CRED-..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 font-medium"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {preview && !result && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Credential Preview</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-6">
            <div><dt className="text-gray-500">Serial</dt><dd className="font-medium">{preview.serial_number}</dd></div>
            <div><dt className="text-gray-500">Holder</dt><dd className="font-medium">{preview.holder_name}</dd></div>
            <div><dt className="text-gray-500">Degree</dt><dd className="font-medium">{preview.degree_name}</dd></div>
            <div><dt className="text-gray-500">Institution</dt><dd className="font-medium">{preview.institution_name}</dd></div>
            <div><dt className="text-gray-500">Status</dt><dd className="font-medium">{preview.status}</dd></div>
          </dl>
          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {verifying ? <Loader /> : null}
            {verifying ? 'Verifying...' : 'Run Verification'}
          </button>
        </div>
      )}

      {result && (
        <div
          className={`rounded-xl p-8 shadow-sm border-2 ${
            result.valid
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {result.valid ? (
              <CheckCircle className="text-green-600" size={48} />
            ) : (
              <XCircle className="text-red-600" size={48} />
            )}
            <div>
              <h3
                className={`text-2xl font-bold ${
                  result.valid ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {result.valid ? 'CREDENTIAL VERIFIED' : 'VERIFICATION FAILED'}
              </h3>
              {!result.valid && result.step && (
                <p className="text-sm text-red-600 mt-1">Failed at step {result.step}</p>
              )}
            </div>
          </div>

          {result.valid && result.credential ? (
            <div className="bg-white/70 rounded-lg p-4 space-y-2 text-sm">
              <p><span className="text-gray-500">Holder:</span> <strong>{result.credential.holder_name}</strong></p>
              <p><span className="text-gray-500">Degree:</span> <strong>{result.credential.degree_name}</strong></p>
              <p><span className="text-gray-500">Major:</span> <strong>{result.credential.major || '—'}</strong></p>
              <p><span className="text-gray-500">Institution:</span> <strong>{result.credential.institution_name}</strong></p>
              <p><span className="text-gray-500">Year:</span> <strong>{result.credential.graduation_year}</strong></p>
              <p><span className="text-gray-500">GPA:</span> <strong>{result.credential.gpa}</strong></p>
              <p><span className="text-gray-500">Issue Date:</span> <strong>{formatDate(result.credential.issue_date)}</strong></p>
              <p className="text-xs text-gray-400 pt-2">Verified at {formatDateTime(new Date().toISOString())}</p>
            </div>
          ) : (
            <p className="text-red-800 font-medium text-lg">
              {FAILURE_MESSAGES[result.reason] || result.reason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
