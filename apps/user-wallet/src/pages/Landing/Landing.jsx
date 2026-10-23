import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Wallet,
  QrCode,
  Lock,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  Fingerprint,
  Building2,
  Sparkles,
  KeyRound,
  FileText,
} from 'lucide-react';
import mark from '../../assets/mark.png';

export default function Landing() {
  const [activeStep, setActiveStep] = useState(1);

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
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Student Wallet
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">National Credential Trust Grid</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-navy-950 transition-colors">How It Works</a>
            <a href="#security" className="hover:text-navy-950 transition-colors">Security & Trust</a>
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
              <span>Create Wallet</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200/80">
        <div className="absolute top-0 right-1/4 -mt-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -ml-24 h-96 w-96 rounded-full bg-navy-500/10 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Ethiopia's Official Academic Credential Wallet</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-navy-950 font-display leading-[1.12]">
                Your Degrees & Diplomas. <br className="hidden sm:inline" />
                <span className="text-emerald-700">Owned by You.</span> Verifiable Globally.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Replace slow paper transcripts and expensive notary stamps. EthioCred stores RSA-2048 cryptographically signed credentials from Ethiopian universities, giving you absolute ownership and one-click verification consent.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white shadow-soft hover:bg-navy-800 transition-all focus-ring active:scale-98"
                >
                  <Wallet size={18} />
                  <span>Open Your Free Wallet</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-soft hover:bg-slate-50 hover:text-slate-900 transition-all focus-ring"
                >
                  <Fingerprint size={18} className="text-emerald-600" />
                  <span>Sign In with Fayda ID</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-2xl font-extrabold text-navy-950 font-display tabular-nums">100%</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Cryptographic Proof</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-navy-950 font-display tabular-nums">RSA-2048</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Asymmetric Key Signatures</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-navy-950 font-display tabular-nums">&lt; 3 Sec</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Instant Verification</p>
                </div>
              </div>
            </div>

            {/* Right Column: CSS/SVG Certificate Mockup */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Certificate Surface */}
                <div className="relative rounded-2xl border-2 border-slate-300/90 bg-white p-6 shadow-certificate overflow-hidden">
                  {/* Watermark Crest */}
                  <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-[0.04] pointer-events-none">
                    <img src={mark} alt="" className="w-full h-full object-contain" />
                  </div>

                  {/* Guilloche decorative header bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-amber-500 to-navy-900 rounded-full mb-5" />

                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <img src={mark} alt="" className="h-9 w-9 object-contain" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">FDRE National Credential</p>
                        <p className="text-xs font-bold text-navy-950 font-display">Addis Ababa University</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                      ACTIVE
                    </span>
                  </div>

                  <div className="py-5 space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Conferred Degree</p>
                      <p className="text-base font-bold text-navy-950 font-display">Bachelor of Science in Software Engineering</p>
                      <p className="text-xs text-slate-500">Major: Distributed Systems & Cryptography</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                      <div>
                        <p className="text-[10px] uppercase text-slate-400 font-semibold">Recipient</p>
                        <p className="font-bold text-slate-900">Abebe Bekele Tessema</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-400 font-semibold">Cumulative GPA</p>
                        <p className="font-extrabold text-navy-900 tabular-nums">3.89 / 4.00</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-400 font-semibold">Fayda National ID</p>
                        <p className="font-mono text-slate-700">FAYDA-001-9821</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-400 font-semibold">Serial Number</p>
                        <p className="font-mono text-slate-700">AAU-SE-2024-0042</p>
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Proof footer */}
                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50/50 -mx-6 -mb-6 p-4">
                    <div className="flex items-center gap-1.5">
                      <KeyRound size={14} className="text-emerald-600" />
                      <span>RSA-2048 Signed by Registrar</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 size={14} />
                      <span>Tamper-Free</span>
                    </div>
                  </div>
                </div>

                {/* Floating QR Badge */}
                <div className="absolute -bottom-6 -right-4 rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur p-3 shadow-hover flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-white">
                    <QrCode size={20} />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">Instant QR Verify</p>
                    <p className="text-[11px] text-slate-500">Scan with any smartphone</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Cryptographic Verification Works (3-Step Chain) */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-navy-50 text-navy-800 border border-navy-200">
              <Sparkles size={13} /> The Cryptographic Chain of Trust
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-display tracking-tight">
              How Academic Verification Works in Ethiopia
            </h2>
            <p className="text-base text-slate-500">
              Built on open cryptographic standards: zero paper, zero fraud, zero bureaucracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-8 shadow-soft flex flex-col justify-between hover:shadow-card transition-all">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shadow-soft">
                    <Building2 size={24} />
                  </div>
                  <span className="text-xs font-extrabold font-mono text-slate-400">STAGE 01</span>
                </div>
                <h3 className="text-xl font-bold text-navy-950 font-display mb-2">
                  1. Institution Signs
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your university registrar uploads graduation records and signs each certificate using the institution's private RSA-2048 key. The digital signature is anchored to the national registry.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-amber-800">
                <CheckCircle2 size={16} />
                <span>Authorized Registrar Root</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border-2 border-emerald-500/80 bg-white p-8 shadow-card flex flex-col justify-between ring-4 ring-emerald-50">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-soft">
                    <Wallet size={24} />
                  </div>
                  <span className="text-xs font-extrabold font-mono text-emerald-700">STAGE 02 · YOU</span>
                </div>
                <h3 className="text-xl font-bold text-navy-950 font-display mb-2">
                  2. Student Consents
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The signed degree is deposited directly into your personal wallet, tied to your Fayda ID. Employers can only request access; nothing is disclosed without your explicit, logged permission.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={16} />
                <span>Fayda ID Sovereign Consent</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-8 shadow-soft flex flex-col justify-between hover:shadow-card transition-all">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-white shadow-soft">
                    <ShieldCheck size={24} />
                  </div>
                  <span className="text-xs font-extrabold font-mono text-slate-400">STAGE 03</span>
                </div>
                <h3 className="text-xl font-bold text-navy-950 font-display mb-2">
                  3. Employer Verifies
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The employer’s portal verifies the credential in seconds: resolving the university’s public key, computing canonical SHA-256 hashes, and checking real-time revocation status.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-navy-900">
                <CheckCircle2 size={16} />
                <span>Zero Forgery Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Cryptography Trust Section */}
      <section id="security" className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Lock size={13} /> Bank-Grade Cryptographic Rigor
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-display tracking-tight">
              Engineered with Mathematical Trust
            </h2>
            <p className="text-base text-slate-500">
              Not a paper certificate scanned into a PDF. EthioCred uses rigorous asymmetric cryptography to provide unbreakable proof.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy-900 border border-navy-100">
                <KeyRound size={20} />
              </div>
              <h3 className="font-bold text-navy-950 font-display">RSA-2048 Digital Signatures</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Asymmetric cryptography ensures only authorized university registrar private keys can create credentials.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy-900 border border-navy-100">
                <FileCheck2 size={20} />
              </div>
              <h3 className="font-bold text-navy-950 font-display">SHA-256 Canonical Integrity</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Even modifying a single digit of your GPA or graduation year breaks the hash check and triggers immediate rejection.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy-900 border border-navy-100">
                <Fingerprint size={20} />
              </div>
              <h3 className="font-bold text-navy-950 font-display">Fayda ID Sovereign Binding</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Credentials belong to actual verified individuals, preventing identity theft and credential impersonation.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy-900 border border-navy-100">
                <FileText size={20} />
              </div>
              <h3 className="font-bold text-navy-950 font-display">Tamper-Evident Audit Trail</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every consent event and verification request is cryptographically recorded in the audit log.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Specific CTA */}
      <section className="py-16 sm:py-20 bg-navy-950 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            Get Started Today
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight">
            Take Full Control of Your Academic Achievements
          </h2>
          <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join thousands of Ethiopian university graduates who store and share their verified credentials safely.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-soft hover:bg-emerald-500 transition-all focus-ring"
            >
              <Wallet size={18} />
              <span>Create Your Student Wallet</span>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-all focus-ring"
            >
              <span>Sign In to Existing Wallet</span>
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
              <p className="font-bold text-slate-900 font-display">EthioCred National Credential Grid</p>
              <p className="text-[11px] text-slate-400">Federal Democratic Republic of Ethiopia</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-slate-600">
            <a href="http://localhost:5174" className="hover:text-navy-950 transition-colors">University Portal</a>
            <a href="http://localhost:5175" className="hover:text-navy-950 transition-colors">Employer Portal</a>
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
