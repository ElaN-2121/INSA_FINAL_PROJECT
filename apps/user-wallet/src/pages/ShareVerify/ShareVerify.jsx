import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Shield, XCircle } from 'lucide-react';
import axios from 'axios';
import { formatDate, formatDateTime } from '@ethiocred/utils';
import Loader from '../../components/Loader/Loader.jsx';
import logo from '../../assets/logo.png';

const API_BASE = 'http://localhost:5000/api';

const LINK_MESSAGES = {
  LINK_NOT_FOUND: 'This verification link does not exist or has been deactivated.',
  LINK_EXPIRED: 'This verification link has expired. Please request a new link from the credential holder.',
  LINK_LIMIT_REACHED: 'This link has reached its maximum number of uses.',
};

const FAILURE_MESSAGES = {
  CREDENTIAL_NOT_FOUND: 'Credential does not exist in the system',
  UNTRUSTED_INSTITUTION: 'Issuing institution is not in the Trust Registry',
  NO_PUBLIC_KEY: 'Issuing institution is not in the Trust Registry',
  INTEGRITY_VIOLATION: 'Credential data has been tampered with',
  INVALID_SIGNATURE: 'Digital signature verification failed',
  CREDENTIAL_REVOKED: 'This credential has been revoked by the institution',
};

export default function ShareVerify() {
  const { token } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE}/share-links/verify/${token}`)
      .then(({ data }) => setResult(data.data))
      .catch(() => setResult({ valid: false, reason: 'LINK_NOT_FOUND' }))
      .finally(() => setLoading(false));
  }, [token]);

  const linkError = result && !result.valid && LINK_MESSAGES[result.reason];
  const verifyFailed = result && !result.valid && !LINK_MESSAGES[result.reason];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
          <img src={logo} alt="EthioCred logo" className="h-10 w-10 rounded-lg object-contain" />
          <div>
            <p className="text-lg font-semibold text-gray-900">EthioCred Verification</p>
            <p className="text-xs text-gray-500">Public credential verification</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : result?.reason === 'LINK_NOT_FOUND' ? (
          <div className="rounded-xl border-2 border-red-300 bg-red-50 p-8 text-center shadow-sm">
            <XCircle className="mx-auto mb-4 text-red-600" size={40} />
            <p className="text-lg font-medium text-red-900">{LINK_MESSAGES.LINK_NOT_FOUND}</p>
          </div>
        ) : linkError ? (
          <div className="rounded-xl border-2 border-yellow-300 bg-yellow-50 p-8 text-center shadow-sm">
            <XCircle className="mx-auto mb-4 text-yellow-600" size={40} />
            <p className="text-lg font-medium text-yellow-900">{linkError}</p>
          </div>
        ) : result?.valid ? (
          <div className="rounded-xl border-2 border-green-300 bg-green-50 p-8 shadow-sm">
            <div className="mb-6 flex items-start gap-4">
              <CheckCircle className="shrink-0 text-green-600" size={40} />
              <div>
                <h1 className="text-2xl font-bold text-green-800">CREDENTIAL VERIFIED</h1>
                <p className="mt-1 text-sm text-green-700">
                  Verified at {formatDateTime(new Date().toISOString())}
                  {result.expiresAt && ` | Link expires ${formatDateTime(result.expiresAt)}`}
                </p>
              </div>
            </div>
            {result.credential && (
              <div className="space-y-3 rounded-lg bg-white/80 p-5 text-sm">
                <p><span className="text-gray-500">Holder:</span> <strong>{result.credential.holder_name}</strong></p>
                <p><span className="text-gray-500">Degree:</span> <strong>{result.credential.degree_name}</strong></p>
                <p><span className="text-gray-500">Major:</span> <strong>{result.credential.major || '—'}</strong></p>
                <p><span className="text-gray-500">Institution:</span> <strong>{result.credential.institution_name}</strong></p>
                <p><span className="text-gray-500">Year:</span> <strong>{result.credential.graduation_year}</strong></p>
                <p><span className="text-gray-500">GPA:</span> <strong>{result.credential.gpa}</strong></p>
                <p><span className="text-gray-500">Issue Date:</span> <strong>{formatDate(result.credential.issue_date)}</strong></p>
                <p><span className="text-gray-500">Serial Number:</span> <strong className="font-mono">{result.credential.serial_number}</strong></p>
              </div>
            )}
          </div>
        ) : verifyFailed ? (
          <div className="rounded-xl border-2 border-red-300 bg-red-50 p-8 shadow-sm">
            <div className="mb-4 flex items-start gap-4">
              <XCircle className="shrink-0 text-red-600" size={40} />
              <h1 className="text-2xl font-bold text-red-800">VERIFICATION FAILED</h1>
            </div>
            <p className="text-lg font-medium text-red-800">
              {FAILURE_MESSAGES[result.reason] || result.message || result.reason}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-red-300 bg-red-50 p-8 text-center shadow-sm">
            <XCircle className="mx-auto mb-4 text-red-600" size={40} />
            <p className="text-lg font-medium text-red-800">Unable to verify this link.</p>
          </div>
        )}

        <footer className="mt-10 flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
          <Shield className="mt-0.5 shrink-0 text-blue-600" size={20} />
          <p>
            This verification is powered by EthioCred&apos;s cryptographic verification engine. The credential
            shown has been verified using RSA-2048 digital signatures.
          </p>
        </footer>
      </main>
    </div>
  );
}
