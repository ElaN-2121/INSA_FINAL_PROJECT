import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Printer,
  Calendar,
  Award,
  Hash,
  KeyRound,
  Building2,
  User,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { get, post, formatDate, formatDateTime } from '@ethiocred/utils';
import { Button, Badge, Card, Loader, EmptyState } from '@ethiocred/ui';
import { saveVerificationResult } from '../../utils/verificationCache.js';
import mark from '../../assets/mark.png';

const FAILURE_MESSAGES = {
  CONSENT_REQUIRED: 'You do not have approved access from the student to verify this credential.',
  CREDENTIAL_NOT_FOUND: 'The requested credential ID was not found in the National Credential Registry.',
  UNTRUSTED_INSTITUTION: 'The issuing university is not an accredited, active member of the Trust Registry.',
  NO_PUBLIC_KEY: 'No active RSA public key could be resolved for this issuing institution.',
  INTEGRITY_VIOLATION: 'Cryptographic hash mismatch. The credential data has been tampered with after issuance.',
  INVALID_SIGNATURE: 'RSA digital signature verification failed. The signature does not match the institution private key.',
  CREDENTIAL_REVOKED: 'This credential has been officially revoked by the issuing university.',
};

const VERIFICATION_STEPS = [
  { step: 0, key: 'consent', label: '1. Student Consent Verification', desc: 'Active consent granted by student wallet holder' },
  { step: 1, key: 'existence', label: '2. National Registry Lookup', desc: 'Credential record located in registry database' },
  { step: 2, key: 'institution', label: '3. Institution Accreditation Check', desc: 'Issuing university accredited and active in Trust Registry' },
  { step: 3, key: 'key', label: '4. Public Key Resolution', desc: 'Valid RSA-2048 public key resolved for issuing authority' },
  { step: 4, key: 'hash', label: '5. SHA-256 Canonical Hash Match', desc: 'Computed hash matches sealed credential payload' },
  { step: 5, key: 'signature', label: '6. Digital Signature Validation', desc: 'RSA signature verified with mathematical certainty' },
  { step: 6, key: 'revocation', label: '7. Real-Time Revocation Check', desc: 'Credential is ACTIVE and not revoked or suspended' },
];

export default function VerifyCredential() {
  const [approvedCredentials, setApprovedCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [selectedCred, setSelectedCred] = useState(null);
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
    setSelectedCred(credential);
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader size="lg" color="text-teal-600" />
        <p className="text-sm font-semibold text-slate-500">Loading approved credentials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Print-only CSS styling */}
      <style>{`
        @media print {
          header, aside, button, nav, .no-print { display: none !important; }
          body, main { background: white !important; padding: 0 !important; }
          .print-full { width: 100% !important; border: none !important; box-shadow: none !important; }
        }
      `}</style>

      {/* Screen Header */}
      <div className="no-print">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Verification Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-950 font-display mt-1">
              Verify Academic Credentials
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Select an approved candidate record to execute a full 7-point cryptographic audit.
            </p>
          </div>
          {result && (
            <Button
              type="button"
              variant="outline"
              size="md"
              leftIcon={Printer}
              onClick={handlePrint}
              className="self-start sm:self-auto"
            >
              Print Official Report
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3 shadow-soft no-print">
          <AlertTriangle size={18} className="shrink-0 text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold">Verification Error</p>
            <p className="mt-0.5 text-xs text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Approved Credentials Selector List */}
      <div className="no-print space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Approved Candidate Requests ({approvedCredentials.length})
        </h2>

        {approvedCredentials.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No Approved Credentials Pending Verification"
            description="You don't have access to verify any credentials yet. Request access from a student using their Fayda ID."
            action={
              <Link
                to="/request"
                className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-xs font-semibold text-white shadow-soft hover:bg-navy-800 transition-all focus-ring"
              >
                <span>Request Candidate Access</span>
                <ArrowRight size={14} />
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedCredentials.map((cred) => {
              const isSelected = selectedCred?.credential_id === cred.credential_id;
              const isVerifying = verifyingId === cred.credential_id;

              return (
                <div
                  key={cred.request_id}
                  className={`rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/30 ring-4 ring-teal-50 shadow-soft'
                      : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-soft'
                  }`}
                >
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-900 border border-navy-100 shadow-soft">
                      <GraduationCap size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 font-display truncate">
                        {cred.holder_name}
                      </p>
                      <p className="text-xs font-medium text-slate-700 truncate mt-0.5">
                        {cred.degree_name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {cred.institution_name} · Class of {cred.graduation_year}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      ID: {cred.serial_number || cred.credential_id?.slice(0, 8)}
                    </span>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      isLoading={isVerifying}
                      loadingText="Verifying..."
                      leftIcon={ShieldCheck}
                      onClick={() => handleVerify(cred)}
                      className="bg-navy-900 hover:bg-navy-800 text-white"
                    >
                      Verify Now
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Official Cryptographic Verification Report */}
      {result && (
        <div className="print-full pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className={`rounded-3xl border-2 overflow-hidden shadow-certificate bg-white ${
              result.valid
                ? 'border-emerald-500/80 ring-8 ring-emerald-50/60'
                : 'border-red-500/80 ring-8 ring-red-50/60'
            }`}
          >
            {/* Report Header Bar */}
            <div
              className={`px-6 py-6 sm:px-8 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                result.valid
                  ? 'bg-gradient-to-r from-emerald-900 via-navy-950 to-navy-900 text-white border-emerald-800'
                  : 'bg-gradient-to-r from-red-950 via-slate-950 to-navy-950 text-white border-red-900'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-soft p-1 ${
                    result.valid
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {result.valid ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                      Federal Democratic Republic of Ethiopia
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider ${
                        result.valid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-red-500/20 text-red-300 border border-red-400/40'
                      }`}
                    >
                      {result.valid ? 'CRYPTOGRAPHICALLY VALID' : 'AUDIT FAILED'}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-white mt-0.5">
                    {result.valid ? 'Official Credential Verification Report' : 'Verification Audit Failure Report'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 font-mono">
                    Audit Ref: EC-VR-{result.credential?.serial_number || 'ALERT'} · {formatDateTime(new Date().toISOString())}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-end justify-between sm:justify-center text-xs text-slate-300">
                <span className="font-semibold text-white">INSA Registry Root</span>
                <span className="text-[11px] text-slate-400 font-mono">SHA-256 / RSA-2048</span>
              </div>
            </div>

            {/* Main Report Body */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Academic Record Dossier */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <User size={14} /> Conferred Academic Record
                  </h4>

                  {result.valid && result.credential ? (
                    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-6 space-y-4">
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold">Awarded Degree</p>
                        <h4 className="text-lg font-bold text-navy-950 font-display mt-0.5">
                          {result.credential.degree_name}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          Major: {result.credential.major || 'General'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200/80 text-xs">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Graduate Name</p>
                          <p className="font-bold text-slate-900 mt-0.5">{result.credential.holder_name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Cumulative GPA</p>
                          <p className="font-extrabold text-emerald-700 text-sm mt-0.5 tabular-nums">
                            {result.credential.gpa} / 4.00
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Issuing University</p>
                          <p className="font-bold text-slate-900 mt-0.5">{result.credential.institution_name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Graduation Year</p>
                          <p className="font-bold text-slate-900 mt-0.5">{result.credential.graduation_year}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Registry Serial Number</p>
                          <p className="font-mono text-slate-700 mt-0.5">{result.credential.serial_number}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Issue Date</p>
                          <p className="font-medium text-slate-700 mt-0.5">{formatDate(result.credential.issue_date)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 space-y-3">
                      <div className="flex items-center gap-2 text-red-800 font-bold font-display text-base">
                        <AlertTriangle size={20} className="text-red-600" />
                        <span>Security Alert: Fraud or Tampering Detected</span>
                      </div>
                      <p className="text-xs text-red-700 leading-relaxed">
                        {FAILURE_MESSAGES[result.reason] || result.message || result.reason}
                      </p>
                      {result.step != null && (
                        <div className="rounded-xl bg-white/80 p-3 text-xs font-mono text-red-900 border border-red-200">
                          Failure Step: #{result.step} ({VERIFICATION_STEPS.find((s) => s.step === result.step)?.label || 'Step'})
                        </div>
                      )}
                      <p className="text-[11px] text-red-600 font-medium">
                        Recommendation: Do not accept this diploma certificate as genuine. The cryptographic digital signature or payload checksum does not match the national registry.
                      </p>
                    </div>
                  )}
                </div>

                {/* Audit Integrity Seal Box */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-between text-xs shadow-soft">
                  <div className="flex items-center gap-3">
                    <img src={mark} alt="" className="h-10 w-10 object-contain" />
                    <div>
                      <p className="font-bold text-navy-950 font-display">National Trust Authority Anchor</p>
                      <p className="text-[11px] text-slate-500">Ministry of Education · INSA Root Key Registry</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[10px] text-slate-400">RSA-2048 PKCS #1</span>
                    <p className="text-[11px] font-bold text-emerald-700">Digital Seal Intact</p>
                  </div>
                </div>
              </div>

              {/* Right Column: 7-Point Cryptographic Chain Timeline */}
              <div className="lg:col-span-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <KeyRound size={14} /> 7-Point Cryptographic Audit Chain
                </h4>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3.5">
                  {VERIFICATION_STEPS.map((stepItem) => {
                    const failedAtThisStep = !result.valid && result.step === stepItem.step;
                    const passed = result.valid || (result.step != null && stepItem.step < result.step);
                    const notReached = !result.valid && result.step != null && stepItem.step > result.step;

                    return (
                      <div
                        key={stepItem.key}
                        className={`p-3 rounded-xl transition-all border ${
                          failedAtThisStep
                            ? 'bg-red-50 border-red-300 ring-2 ring-red-100'
                            : passed
                            ? 'bg-white border-slate-200/80 shadow-2xs'
                            : 'bg-slate-100/60 border-transparent opacity-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            {failedAtThisStep ? (
                              <XCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                            ) : passed ? (
                              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p
                                className={`text-xs font-bold ${
                                  failedAtThisStep
                                    ? 'text-red-900'
                                    : passed
                                    ? 'text-slate-900'
                                    : 'text-slate-400'
                                }`}
                              >
                                {stepItem.label}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {stepItem.desc}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                              failedAtThisStep
                                ? 'bg-red-600 text-white'
                                : passed
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'text-slate-400'
                            }`}
                          >
                            {failedAtThisStep ? 'FAIL' : passed ? 'PASS' : 'SKIP'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Verification Footer Bar */}
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <span>This document serves as court-admissible proof under the Ethiopian Electronic Signature Proclamation.</span>
              <div className="flex items-center gap-3 no-print">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={Printer}
                  onClick={handlePrint}
                >
                  Download / Print PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
