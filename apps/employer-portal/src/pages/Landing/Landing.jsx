import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  SearchCheck,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Building2,
  Sparkles,
  KeyRound,
  FileText,
  Clock,
  Printer,
} from 'lucide-react';
import mark from '../../assets/mark.png';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-navy-100 selection:text-navy-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src={mark}
              alt="EthioCred"
              className="h-10 w-10 rounded-xl object-contain p-0.5 bg-navy-50/50 border border-slate-200/80 shadow-soft"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-display tracking-tight text-navy-950">EthioCred</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                  Employer Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">National Candidate Verification Grid</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-navy-950 transition-colors">How It Works</a>
            <a href="#security" className="hover:text-navy-950 transition-colors">6-Step Cryptographic Audit</a>
            <a href="#features" className="hover:text-navy-950 transition-colors">Features</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-ring"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2 text-xs font-semibold text-white shadow-soft hover:bg-navy-800 transition-all focus-ring active:scale-98"
            >
              <span>Register Company</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200/80">
        <div className="absolute top-0 right-1/4 -mt-24 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -ml-24 h-96 w-96 rounded-full bg-navy-500/10 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-900 shadow-2xs">
                <SearchCheck size={14} className="text-teal-700" />
                <span>Instant Academic Background Verification</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-navy-950 font-display leading-[1.12]">
                Verify Ethiopian Degrees in Seconds. <br className="hidden sm:inline" />
                <span className="text-teal-700">Zero Forgery.</span> Zero Wait.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Stop waiting weeks for physical letters or notary stamps. Run cryptographic verifications directly against university RSA-2048 keys and the National Trust Registry. Generate court-admissible audit reports instantly.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white shadow-soft hover:bg-navy-800 transition-all focus-ring active:scale-98"
                >
                  <SearchCheck size={18} />
                  <span>Start Verifying Candidates</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-soft hover:bg-slate-50 hover:text-slate-900 transition-all focus-ring"
                >
                  <span>Sign In to Company Account</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-2xl font-extrabold text-navy-950 font-display tabular-nums">&lt; 5s</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Instant Verification</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-navy-950 font-display tabular-nums">6-Step</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Cryptographic Audit Chain</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-navy-950 font-display tabular-nums">100%</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Tamper Prevention</p>
                </div>
              </div>
            </div>

            {/* Right Column: CSS Verification Report Preview */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="rounded-2xl border-2 border-slate-300/90 bg-white p-6 shadow-certificate space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy-950 font-display">Cryptographic Verification Report</p>
                        <p className="text-[10px] text-slate-400">Ref: EC-VR-89210 · Addis Ababa University</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                      VERIFIED ✓
                    </span>
                  </div>

                  {/* Candidate Data */}
                  <div className="bg-slate-50/80 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100">
                    <p><span className="text-slate-400 font-medium">Candidate:</span> <strong className="text-slate-900">Abebe Bekele Tessema</strong></p>
                    <p><span className="text-slate-400 font-medium">Degree:</span> <strong className="text-slate-900">B.Sc. Software Engineering</strong></p>
                    <p><span className="text-slate-400 font-medium">Institution:</span> <strong className="text-slate-900">Addis Ababa University</strong></p>
                    <p><span className="text-slate-400 font-medium">Cumulative GPA:</span> <strong className="text-emerald-700">3.89 / 4.00 (Tamper-Free)</strong></p>
                  </div>

                  {/* 6-Step Verification Mini Chain */}
                  <div className="space-y-1.5 pt-1 text-[11px]">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>1. Student Consent</span>
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 font-mono">APPROVED</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>2. Trust Registry Lookup</span>
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 font-mono">AAU ACTIVE</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>3. RSA-2048 Public Key</span>
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 font-mono">RESOLVED</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>4. SHA-256 Hash Digest</span>
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 font-mono">MATCH</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>5. Digital Signature Proof</span>
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 font-mono">VALID</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>6. Real-time Revocation</span>
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 font-mono">ACTIVE</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Audit sealed on INSA Registry</span>
                    <span className="font-semibold text-navy-900 flex items-center gap-1">
                      <Printer size={12} /> Printable Dossier
                    </span>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-6 -right-4 rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur p-3 shadow-hover flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white">
                    <Clock size={20} />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">Immediate Result</p>
                    <p className="text-[11px] text-slate-500">Zero weeks of manual waiting</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Chain */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-navy-50 text-navy-800 border border-navy-200">
              <Sparkles size={13} /> The Verification Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-display tracking-tight">
              3 Simple Steps to 100% Verifiable Hiring
            </h2>
            <p className="text-base text-slate-500">
              Respecting student privacy while guaranteeing absolute academic authenticity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-8 shadow-soft flex flex-col justify-between hover:shadow-card transition-all">
              <div>
                <span className="text-xs font-mono font-extrabold text-slate-400">STEP 01</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-800 shadow-soft my-5">
                  <SearchCheck size={24} />
                </div>
                <h3 className="text-xl font-bold text-navy-950 font-display mb-2">Request Candidate Access</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Enter the candidate's Fayda ID or scan their QR code. A consent request is securely sent directly to their EthioCred wallet.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-teal-800">
                <CheckCircle2 size={16} />
                <span>GDPR & National Privacy Compliant</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-8 shadow-soft flex flex-col justify-between hover:shadow-card transition-all">
              <div>
                <span className="text-xs font-mono font-extrabold text-slate-400">STEP 02</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shadow-soft my-5">
                  <Clock size={24} />
                </div>
                <h3 className="text-xl font-bold text-navy-950 font-display mb-2">Candidate Approves</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The graduate reviews your company name and requested credential, tapping "Approve". Access is granted with cryptographic time-limits.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-amber-800">
                <CheckCircle2 size={16} />
                <span>Zero Unauthorized Surveillance</span>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-teal-500/80 bg-white p-8 shadow-card ring-4 ring-teal-50 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-extrabold text-teal-700">STEP 03</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white shadow-soft my-5">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-bold text-navy-950 font-display mb-2">Run Cryptographic Audit</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Our system verifies the registrar’s RSA signature, matches canonical SHA-256 hashes, checks revocation lists, and delivers a downloadable PDF report.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-teal-700">
                <CheckCircle2 size={16} />
                <span>Court-Admissible Verification Dossier</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Specific CTA */}
      <section className="py-16 sm:py-20 bg-navy-950 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight">
            Protect Your Organization from Academic Fraud
          </h2>
          <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Register your company today and start verifying Ethiopian university credentials instantly.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-soft hover:bg-teal-500 transition-all focus-ring"
            >
              <Building2 size={18} />
              <span>Register Company Account</span>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-all focus-ring"
            >
              <span>Sign In to Existing Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Government-Grade Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={mark} alt="EthioCred" className="h-8 w-8 object-contain" />
            <div>
              <p className="font-bold text-slate-900 font-display">EthioCred Employer Verification Grid</p>
              <p className="text-[11px] text-slate-400">Federal Democratic Republic of Ethiopia</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-slate-600">
            <a href="http://localhost:5173" className="hover:text-navy-950 transition-colors">Student Wallet</a>
            <a href="http://localhost:5174" className="hover:text-navy-950 transition-colors">University Portal</a>
            <a href="http://localhost:5176" className="hover:text-navy-950 transition-colors">National Trust Registry</a>
          </div>

          <p className="text-slate-400">
            &copy; 2026 EthioCred. Standards compliant: FIPS 180-4 · PKCS #1 v2.2.
          </p>
        </div>
      </footer>
    </div>
  );
}
