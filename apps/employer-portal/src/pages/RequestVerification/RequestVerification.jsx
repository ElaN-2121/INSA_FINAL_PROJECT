import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '@ethiocred/utils';

export default function RequestVerification() {
  const [credentialId, setCredentialId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentialId.trim()) return;
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await post(`/verification/request/${credentialId.trim()}`);
      setSuccess(true);
      setTimeout(() => navigate('/request-status'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Request Verification</h2>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-lg">
        <p className="text-sm text-gray-600 mb-4">
          Submit a verification request to the credential holder. The student must approve before you can verify.
        </p>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
            Request sent — awaiting student approval. Redirecting...
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credential ID</label>
            <input
              type="text"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              placeholder="Enter credential UUID"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
