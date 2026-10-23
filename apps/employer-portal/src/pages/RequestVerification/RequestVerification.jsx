import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ShieldCheck, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { post } from '@ethiocred/utils';
import { Button, Input, PageHeader, Alert } from '@ethiocred/ui';

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
      setError(err.response?.data?.message || 'Failed to send verification request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Request Candidate Verification Consent"
        description="Initiate sovereign student consent requests to access sealed academic records."
      />

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold">Consent Request Dispatched Successfully</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              The student has been notified in their sovereign wallet. Redirecting to request status...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Form Container */}
        <div className="md:col-span-3 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="credentialId" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Credential Unique Identifier (UUID) *
              </label>
              <input
                id="credentialId"
                type="text"
                required
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                placeholder="e.g. c0000000-0000-4000-8000-000000000001"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200"
              />
              <p className="mt-2 text-xs text-slate-500">
                Found on candidate application forms, QR verification badges, or digital resumes.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || success || !credentialId.trim()}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white shadow-sm"
            >
              <Send className="mr-2 h-4 w-4" />
              {loading ? 'Transmitting Request...' : 'Dispatch Consent Request'}
            </Button>
          </form>
        </div>

        {/* Sovereign Consent Explainer Card */}
        <div className="md:col-span-2 rounded-2xl border border-navy-100 bg-gradient-to-br from-navy-50 to-slate-100 p-6 space-y-4">
          <div className="flex items-center gap-2 text-navy-900">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="font-display font-bold text-sm">
              Sovereign Consent Model
            </h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            In compliance with Ethiopian National Digital Identity standards, employers cannot inspect or verify student records without direct, cryptographically signed authorization from the student's wallet.
          </p>

          <div className="space-y-2.5 pt-2 border-t border-navy-200/50 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-800 text-[10px] font-bold text-white">
                1
              </span>
              <span>You submit the credential identifier.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-800 text-[10px] font-bold text-white">
                2
              </span>
              <span>Candidate receives instant wallet notification.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-800 text-[10px] font-bold text-white">
                3
              </span>
              <span>Once approved, you can verify authenticity immediately.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
