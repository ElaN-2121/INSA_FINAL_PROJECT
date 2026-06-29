import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@ethiocred/utils';

const ResultBadge = ({ detected }) =>
  detected ? (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
      <CheckCircle size={14} /> Attack Detected
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
      <XCircle size={14} /> Not Detected — Check System
    </span>
  );

const JsonBlock = ({ data }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
      >
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {open ? 'Hide' : 'Show'} raw JSON response
      </button>
      {open && (
        <pre className="mt-3 max-h-72 overflow-auto rounded-3xl bg-slate-950 px-4 py-4 text-xs text-emerald-300 shadow-inner">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

const DemoCard = ({ icon, title, description, children }) => (
  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-700 shadow-sm">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
    </div>
    {children}
  </div>
);

const TamperingDemo = () => {
  const [credentialId, setCredentialId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  const run = async () => {
    if (!credentialId.trim()) {
      setErr('Please enter a Credential ID.');
      return;
    }
    setLoading(true);
    setErr('');
    setResult(null);
    try {
      const res = await api.post(`/security/demo/tamper/${credentialId.trim()}`);
      setResult(res.data.data);
    } catch (e) {
      setErr(e.response?.data?.message || 'Request failed. Check the credential ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DemoCard
      icon={<AlertTriangle size={22} />}
      title="Credential Tampering Attack"
      description="Simulates an attacker modifying a credential's GPA after issuance. The system detects the change via hash mismatch and RSA signature failure."
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Credential ID (UUID)"
          value={credentialId}
          onChange={(e) => setCredentialId(e.target.value)}
          className="flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Running…' : 'Run Demo'}
        </button>
      </div>

      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}

      {result && (
        <div className="mt-4 space-y-4">
          <ResultBadge detected={result.result === 'ATTACK_DETECTED'} />

          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Original GPA</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{result.originalGpa}</p>
            </div>
            <div className="rounded-3xl bg-rose-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tampered GPA</p>
              <p className="mt-2 text-lg font-semibold text-rose-700">{result.tamperedGpa}</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Original Valid</p>
              <p className="mt-2 text-lg font-semibold text-emerald-700">
                {result.originalHashValid ? 'Yes ✓' : 'No'}
              </p>
            </div>
            <div className="rounded-3xl bg-rose-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tampered Signature</p>
              <p className="mt-2 text-lg font-semibold text-rose-700">
                {result.signatureValid ? 'Valid (unexpected)' : 'Failed ✓'}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
            <strong>Explanation:</strong> {result.explanation}
          </div>

          <JsonBlock data={result} />
        </div>
      )}
    </DemoCard>
  );
};

const RogueIssuerDemo = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  const run = async () => {
    setLoading(true);
    setErr('');
    setResult(null);
    try {
      const res = await api.post('/security/demo/rogue-issuer');
      setResult(res.data.data);
    } catch (e) {
      setErr(e.response?.data?.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DemoCard
      icon={<Shield size={22} />}
      title="Rogue Issuer Attack"
      description="Simulates an attacker signing a fake credential with their own RSA key. The institution is rejected because it is not in the Trust Registry."
    >
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Running…' : 'Run Demo'}
      </button>

      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}

      {result && (
        <div className="mt-4 space-y-4">
          <ResultBadge detected={result.result === 'ATTACK_DETECTED'} />

          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fake Institution</p>
              <p className="mt-2 font-semibold text-slate-900">{result.fakeInstitution}</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">In Trust Registry?</p>
              <p className="mt-2 font-semibold text-emerald-700">
                {result.institutionInTrustRegistry ? 'Yes (unexpected)' : 'No — Rejected ✓'}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Rogue Key Signature</p>
              <p className="mt-2 font-semibold text-slate-700">
                {result.signatureWithRogueKey
                  ? 'Mathematically valid, but institution untrusted ✓'
                  : 'Invalid'}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
            <strong>Explanation:</strong> {result.explanation}
          </div>

          <JsonBlock data={result} />
        </div>
      )}
    </DemoCard>
  );
};

const RevocationDemo = () => {
  const [credentialId, setCredentialId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  const run = async () => {
    if (!credentialId.trim()) {
      setErr('Please enter a Credential ID.');
      return;
    }
    setLoading(true);
    setErr('');
    setResult(null);
    try {
      const res = await api.post(`/security/demo/revocation/${credentialId.trim()}`);
      setResult(res.data.data);
    } catch (e) {
      setErr(e.response?.data?.message || 'Request failed. Make sure the credential is ACTIVE.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DemoCard
      icon={<XCircle size={22} />}
      title="Revocation Bypass Attempt"
      description="Simulates an attacker using a revoked credential. Verification fails at the revocation check even though the RSA signature remains valid."
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="ACTIVE Credential ID (UUID)"
          value={credentialId}
          onChange={(e) => setCredentialId(e.target.value)}
          className="flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Running…' : 'Run Demo'}
        </button>
      </div>

      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}

      {result && (
        <div className="mt-4 space-y-4">
          <ResultBadge detected={result.result === 'ATTACK_DETECTED'} />

          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div className="rounded-3xl bg-emerald-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Before Revocation</p>
              <p className="mt-2 font-semibold text-emerald-700">
                {result.verificationBeforeRevocation.valid ? 'Valid ✓' : 'Invalid'}
              </p>
              <p className="text-xs text-slate-500">{result.verificationBeforeRevocation.reason}</p>
            </div>
            <div className="rounded-3xl bg-rose-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">After Revocation</p>
              <p className="mt-2 font-semibold text-rose-700">
                {result.verificationAfterRevocation.valid ? 'Valid (unexpected)' : 'Rejected ✓'}
              </p>
              <p className="text-xs text-slate-500">{result.verificationAfterRevocation.reason}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Note:</strong> The credential was automatically restored to ACTIVE after this demonstration.
          </div>

          <div className="rounded-3xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
            <strong>Explanation:</strong> {result.explanation}
          </div>

          <JsonBlock data={result} />
        </div>
      )}
    </DemoCard>
  );
};

const SecurityDemo = () => (
  <div className="mx-auto max-w-4xl space-y-6">
    <div className="mb-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
        <Shield size={24} className="text-red-600" />
        Security Validation Suite
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        These demonstrations prove that EthioCred correctly detects and rejects three common attack
        scenarios. All demos are safe — no permanent changes are made to your data.
      </p>
    </div>

    <TamperingDemo />
    <RogueIssuerDemo />
    <RevocationDemo />
  </div>
);

export default SecurityDemo;
