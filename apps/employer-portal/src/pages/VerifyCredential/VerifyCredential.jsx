import { Loader } from '@ethiocred/ui';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, GraduationCap, ShieldCheck, XCircle } from 'lucide-react';
import { get, post, formatDate, formatDateTime } from '@ethiocred/utils';
import { saveVerificationResult } from '../../utils/verificationCache.js';

const FAILURE_MESSAGES = {
  CONSENT_REQUIRED:
    'You do not have approved access to verify this credential. Please request access first.',
  CREDENTIAL_NOT_FOUND: 'Credential does not exist in the system',
  UNTRUSTED_INSTITUTION: 'Issuing institution is not in the Trust Registry',
  NO_PUBLIC_KEY: 'Issuing institution is not in the Trust Registry',
  INTEGRITY_VIOLATION: 'Credential data has been tampered with',
  INVALID_SIGNATURE: 'Digital signature verification failed',
  CREDENTIAL_REVOKED: 'This credential has been revoked by the institution',
};

export default function VerifyCredential() {
  const [approvedCredentials, setApprovedCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    get('/verification/approved')
      .then(({ data }) => setApprovedCredentials(data.data || []))
      .catch((err) =>
        setError(err.response?.data?.message || err.message || 'Failed to load approved credentials')
      )
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (credential) => {
    setVerifyingId(credential.credential_id);
    setError('');
    setResult(null);

    try {
      const { data } = await post(`/verification/verify/${credential.credential_id}`);
      const verificationResult = data.data;
      setResult(verificationResult);
      saveVerificationResult(verificationResult, {
        id: credential.credential_id,
        serial_number: credential.serial_number,
        holder_name: credential.holder_name,
        institution_name: credential.institution_name,
        degree_name: credential.degree_name,
        major: credential.major,
        graduation_year: credential.graduation_year,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold text-gray-900">Verify Credential</h2>
      <p className="mb-6 text-sm text-gray-500">
        Select an approved credential below to run cryptographic verification.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {approvedCredentials.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-4 text-gray-300" size={48} />
          <p className="mb-4 text-gray-600">
            You don&apos;t have access to verify any credentials yet. Go to Request Verification to
            ask a student for access.
          </p>
          <Link
            to="/request"
            className="inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Request Verification
          </Link>
        </div>
      ) : (
        <div className="mb-8 space-y-4">
          {approvedCredentials.map((credential) => (
            <div
              key={credential.request_id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <GraduationCap size={24} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-gray-900">{credential.holder_name}</p>
                    <p className="text-sm font-medium text-gray-700">{credential.degree_name}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>{credential.institution_name}</span>
                      <span>·</span>
                      <span>Class of {credential.graduation_year}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleVerify(credential)}
                  disabled={verifyingId === credential.credential_id}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {verifyingId === credential.credential_id ? <Loader /> : <ShieldCheck size={16} />}
                  {verifyingId === credential.credential_id ? 'Verifying...' : 'Verify This Credential'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {result && (
        <div
          className={`rounded-xl border-2 p-8 shadow-sm ${
            result.valid
              ? 'border-green-300 bg-green-50'
              : 'border-red-300 bg-red-50'
          }`}
        >
          <div className="mb-6 flex items-start gap-4">
            {result.valid ? (
              <CheckCircle className="shrink-0 text-green-600" size={40} />
            ) : (
              <XCircle className="shrink-0 text-red-600" size={40} />
            )}
            <div>
              <h3
                className={`text-xl font-bold tracking-tight sm:text-2xl ${
                  result.valid ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {result.valid ? 'CREDENTIAL VERIFIED' : 'VERIFICATION FAILED'}
              </h3>
              {!result.valid && result.step != null && (
                <p className="mt-1 text-sm text-red-600">Failed at step {result.step}</p>
              )}
            </div>
          </div>

          {result.valid && result.credential ? (
            <div className="space-y-3 rounded-lg bg-white/80 p-5 text-sm">
              <p><span className="text-gray-500">Holder:</span> <strong className="text-gray-900">{result.credential.holder_name}</strong></p>
              <p><span className="text-gray-500">Degree:</span> <strong className="text-gray-900">{result.credential.degree_name}</strong></p>
              <p><span className="text-gray-500">Major:</span> <strong className="text-gray-900">{result.credential.major || '—'}</strong></p>
              <p><span className="text-gray-500">Institution:</span> <strong className="text-gray-900">{result.credential.institution_name}</strong></p>
              <p><span className="text-gray-500">Year:</span> <strong className="text-gray-900">{result.credential.graduation_year}</strong></p>
              <p><span className="text-gray-500">GPA:</span> <strong className="text-gray-900">{result.credential.gpa}</strong></p>
              <p><span className="text-gray-500">Issue Date:</span> <strong className="text-gray-900">{formatDate(result.credential.issue_date)}</strong></p>
              <p className="border-t border-gray-200 pt-3 text-xs text-gray-400">
                Verified at {formatDateTime(new Date().toISOString())}
              </p>
            </div>
          ) : (
            <p className="text-lg font-medium text-red-800">
              {FAILURE_MESSAGES[result.reason] || result.message || result.reason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
