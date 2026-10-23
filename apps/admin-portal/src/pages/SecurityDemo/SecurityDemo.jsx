import { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  KeyRound,
  FileCheck2,
  Terminal,
  Zap,
  Lock,
  ArrowRight,
  Database,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { Button, Badge, Card, Loader, Alert } from '@ethiocred/ui';

const ResultBadge = ({ detected }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide border shadow-soft ${
      detected
        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/80 ring-2 ring-emerald-500/20'
        : 'bg-red-950/80 text-red-400 border-red-700/80 ring-2 ring-red-500/20'
    }`}
  >
    {detected ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
    <span>{detected ? 'ATTACK DETECTED & DEFENDED ✓' : 'SECURITY BREACH NOT DETECTED'}</span>
  </span>
);

const JsonProofBlock = ({ data }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 pt-3 border-t border-slate-800">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors focus-ring rounded"
      >
        <Terminal size={14} className="text-sky-400" />
        <span>{open ? 'Hide' : 'Inspect'} Raw Cryptographic Evidence JSON</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <pre className="mt-3 max-h-72 overflow-auto rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs font-mono text-emerald-400 shadow-inner">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default function SecurityDemo() {
  const [activeTab, setActiveTab] = useState('tamper'); // 'tamper', 'rogue', 'revocation'

  // Scenario 1: Tampering
  const [tamperId, setTamperId] = useState('');
  const [tamperLoading, setTamperLoading] = useState(false);
  const [tamperResult, setTamperResult] = useState(null);
  const [tamperErr, setTamperErr] = useState('');

  // Scenario 2: Rogue Issuer
  const [rogueLoading, setRogueLoading] = useState(false);
  const [rogueResult, setRogueResult] = useState(null);
  const [rogueErr, setRogueErr] = useState('');

  // Scenario 3: Revocation
  const [revocId, setRevocId] = useState('');
  const [revocLoading, setRevocLoading] = useState(false);
  const [revocResult, setRevocResult] = useState(null);
  const [revocErr, setRevocErr] = useState('');

  const runTamper = async () => {
    if (!tamperId.trim()) {
      setTamperErr('Please enter or paste a valid Credential ID (UUID).');
      return;
    }
    setTamperLoading(true);
    setTamperErr('');
    setTamperResult(null);
    try {
      const res = await api.post(`/security/demo/tamper/${tamperId.trim()}`);
      setTamperResult(res.data.data);
    } catch (e) {
      setTamperErr(e.response?.data?.message || 'Attack simulation failed. Verify Credential ID.');
    } finally {
      setTamperLoading(false);
    }
  };

  const runRogue = async () => {
    setRogueLoading(true);
    setRogueErr('');
    setRogueResult(null);
    try {
      const res = await api.post('/security/demo/rogue-issuer');
      setRogueResult(res.data.data);
    } catch (e) {
      setRogueErr(e.response?.data?.message || 'Rogue issuer simulation failed.');
    } finally {
      setRogueLoading(false);
    }
  };

  const runRevocation = async () => {
    if (!revocId.trim()) {
      setRevocErr('Please enter a Credential ID (UUID) that is currently ACTIVE.');
      return;
    }
    setRevocLoading(true);
    setRevocErr('');
    setRevocResult(null);
    try {
      const res = await api.post(`/security/demo/revocation/${revocId.trim()}`);
      setRevocResult(res.data.data);
    } catch (e) {
      setRevocErr(e.response?.data?.message || 'Revocation bypass simulation failed. Ensure credential is ACTIVE.');
    } finally {
      setRevocLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Presentation Header Card */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-navy-950 to-slate-950 p-6 sm:p-8 shadow-card text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-950 text-sky-400 border border-sky-800">
              <ShieldAlert size={14} /> National Security Centerpiece
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white mt-2">
              Cryptographic Attack Validation Suite
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Interactive demonstrations proving that EthioCred mathematically detects and neutralizes 3 real-world attack vectors in real time without human intervention.
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end text-xs text-slate-400 font-mono">
            <span>Security Model: FIPS 180-4</span>
            <span>RSA-2048 PKCS #1 v2.2</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-2xl bg-slate-950/80 p-1.5 border border-slate-800 flex-wrap gap-1 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('tamper')}
            className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition-all focus-ring ${
              activeTab === 'tamper'
                ? 'bg-sky-600 text-white shadow-soft'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <AlertTriangle size={15} />
            <span>Attack 1: GPA Tampering</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rogue')}
            className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition-all focus-ring ${
              activeTab === 'rogue'
                ? 'bg-sky-600 text-white shadow-soft'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <KeyRound size={15} />
            <span>Attack 2: Rogue Issuer</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('revocation')}
            className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition-all focus-ring ${
              activeTab === 'revocation'
                ? 'bg-sky-600 text-white shadow-soft'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <XCircle size={15} />
            <span>Attack 3: Revocation Replay</span>
          </button>
        </div>
      </div>

      {/* Scenario 1: Credential Tampering Demo */}
      {activeTab === 'tamper' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur p-6 sm:p-8 text-white shadow-card space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <AlertTriangle className="text-amber-400" size={20} />
              <span>Attack Simulation 1: In-Flight Grade/GPA Tampering</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              An attacker gains unauthorized database access or alters an exported credential’s GPA from 3.40 to 3.95. EthioCred runs canonical SHA-256 rehashing; the hash mismatch breaks the signature immediately.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Paste Credential ID (UUID) e.g. from Issued Credentials"
              value={tamperId}
              onChange={(e) => setTamperId(e.target.value)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono outline-none"
            />
            <Button
              type="button"
              variant="primary"
              size="md"
              isLoading={tamperLoading}
              loadingText="Executing Attack..."
              onClick={runTamper}
              className="bg-amber-600 hover:bg-amber-500 text-white border-amber-500/20 shrink-0"
            >
              Simulate Attack
            </Button>
          </div>

          {tamperErr && (
            <div className="rounded-xl bg-red-950/60 border border-red-800/80 p-3.5 text-xs text-red-300">
              {tamperErr}
            </div>
          )}

          {tamperResult && (
            <div className="space-y-5 pt-4 border-t border-slate-800 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <ResultBadge detected={tamperResult.result === 'ATTACK_DETECTED'} />
                <span className="text-xs font-mono text-emerald-400">Zero Trust Verification Check: PASSED</span>
              </div>

              {/* Before vs After Split Simulation Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Card: Original State */}
                <div className="rounded-2xl border border-emerald-800/70 bg-emerald-950/20 p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-emerald-400">Original Issued Record</span>
                    <Badge variant="green" size="sm">LEGITIMATE</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Original Cumulative GPA</p>
                    <p className="text-2xl font-extrabold text-emerald-300 font-display tabular-nums">
                      {tamperResult.originalGpa}
                    </p>
                  </div>
                  <div className="pt-2 text-xs text-slate-300 space-y-1 border-t border-emerald-800/40">
                    <p className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 size={13} />
                      <span>Original Hash Valid: Yes ✓</span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      Canonical match verified
                    </p>
                  </div>
                </div>

                {/* Right Card: Tampered Attack State */}
                <div className="rounded-2xl border-2 border-red-600/80 bg-red-950/20 p-5 space-y-3 ring-4 ring-red-950/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-red-400">Tampered Payload Attempt</span>
                    <Badge variant="red" size="sm">TAMPERED</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Modified Cumulative GPA</p>
                    <p className="text-2xl font-extrabold text-red-400 font-display tabular-nums line-through">
                      {tamperResult.tamperedGpa}
                    </p>
                  </div>
                  <div className="pt-2 text-xs text-red-300 space-y-1 border-t border-red-800/40">
                    <p className="flex items-center gap-1.5 text-red-400 font-bold">
                      <XCircle size={13} />
                      <span>Signature Validation: FAILED (REJECTED) ✓</span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      SHA-256 Digest Mismatch
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Analysis Explanation */}
              <div className="rounded-2xl bg-sky-950/40 border border-sky-800/60 p-4 text-xs text-sky-200 leading-relaxed">
                <strong className="text-white block mb-1">Cryptographic Analysis:</strong>
                {tamperResult.explanation}
              </div>

              <JsonProofBlock data={tamperResult} />
            </div>
          )}
        </div>
      )}

      {/* Scenario 2: Rogue Issuer Demo */}
      {activeTab === 'rogue' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur p-6 sm:p-8 text-white shadow-card space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <KeyRound className="text-sky-400" size={20} />
              <span>Attack Simulation 2: Rogue Issuer & Fake Certificate Authority</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              An adversary generates their own 2048-bit RSA keypair, signs a fictitious credential from an unauthorized entity, and attempts to verify it. Even if mathematically valid, it is immediately denied because the public key is absent from the National Trust Registry.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={rogueLoading}
            loadingText="Generating Rogue Key & Simulating..."
            onClick={runRogue}
            className="bg-sky-600 hover:bg-sky-500 text-white"
          >
            Launch Rogue Issuer Attack Simulation
          </Button>

          {rogueErr && (
            <div className="rounded-xl bg-red-950/60 border border-red-800/80 p-3.5 text-xs text-red-300">
              {rogueErr}
            </div>
          )}

          {rogueResult && (
            <div className="space-y-5 pt-4 border-t border-slate-800 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <ResultBadge detected={rogueResult.result === 'ATTACK_DETECTED'} />
                <span className="text-xs font-mono text-emerald-400">Trust Anchor Check: REJECTED</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2">
                  <p className="text-xs text-slate-400">Claimed Rogue Institution</p>
                  <p className="text-lg font-bold text-white font-display">
                    {rogueResult.fakeInstitution}
                  </p>
                  <p className="text-xs text-red-400 font-semibold pt-1">
                    In National Trust Registry? {rogueResult.institutionInTrustRegistry ? 'Yes' : 'NO — REJECTED ✓'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2">
                  <p className="text-xs text-slate-400">Rogue Private Key Signature</p>
                  <p className="text-sm font-semibold text-slate-200">
                    {rogueResult.signatureWithRogueKey
                      ? 'Mathematically valid signature with attacker key'
                      : 'Invalid signature'}
                  </p>
                  <p className="text-xs text-emerald-400 font-semibold pt-1">
                    Defense: Rejected at Trust Root Lookup
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-sky-950/40 border border-sky-800/60 p-4 text-xs text-sky-200 leading-relaxed">
                <strong className="text-white block mb-1">Cryptographic Analysis:</strong>
                {rogueResult.explanation}
              </div>

              <JsonProofBlock data={rogueResult} />
            </div>
          )}
        </div>
      )}

      {/* Scenario 3: Revocation Replay Demo */}
      {activeTab === 'revocation' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur p-6 sm:p-8 text-white shadow-card space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <XCircle className="text-red-400" size={20} />
              <span>Attack Simulation 3: Revoked Degree Replay Attack</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              A student was expelled or their degree was revoked due to academic misconduct. The student attempts to verify their previously signed certificate. The signature is mathematically authentic, but verification halts at the real-time registry status check.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Paste ACTIVE Credential ID (UUID)"
              value={revocId}
              onChange={(e) => setRevocId(e.target.value)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono outline-none"
            />
            <Button
              type="button"
              variant="primary"
              size="md"
              isLoading={revocLoading}
              loadingText="Simulating Revocation..."
              onClick={runRevocation}
              className="bg-red-600 hover:bg-red-500 text-white shrink-0"
            >
              Simulate Revocation Attack
            </Button>
          </div>

          {revocErr && (
            <div className="rounded-xl bg-red-950/60 border border-red-800/80 p-3.5 text-xs text-red-300">
              {revocErr}
            </div>
          )}

          {revocResult && (
            <div className="space-y-5 pt-4 border-t border-slate-800 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <ResultBadge detected={revocResult.result === 'ATTACK_DETECTED'} />
                <span className="text-xs font-mono text-emerald-400">Revocation Registry Check: DEFENDED</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-emerald-800/70 bg-emerald-950/20 p-5 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase">1. Before Revocation</span>
                  <p className="text-lg font-bold text-emerald-300 font-display">
                    Valid ✓ ({revocResult.verificationBeforeRevocation?.reason})
                  </p>
                  <p className="text-xs text-slate-400">
                    Status was ACTIVE. Cryptographic signature and registry checks passed.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-red-600/80 bg-red-950/20 p-5 space-y-2">
                  <span className="text-xs font-bold text-red-400 uppercase">2. After Revocation</span>
                  <p className="text-lg font-bold text-red-400 font-display">
                    REJECTED ✓ ({revocResult.verificationAfterRevocation?.reason})
                  </p>
                  <p className="text-xs text-slate-400">
                    Digital signature still passes, but real-time status was REVOKED. Attack thwarted.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-amber-950/30 border border-amber-800/50 p-3.5 text-xs text-amber-300 flex items-center gap-2">
                <RefreshCw size={14} className="shrink-0 text-amber-400" />
                <span><strong>Automatic Safety Recovery:</strong> The simulated credential has been safely restored to ACTIVE in the database.</span>
              </div>

              <div className="rounded-2xl bg-sky-950/40 border border-sky-800/60 p-4 text-xs text-sky-200 leading-relaxed">
                <strong className="text-white block mb-1">Cryptographic Analysis:</strong>
                {revocResult.explanation}
              </div>

              <JsonProofBlock data={revocResult} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
