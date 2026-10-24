import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  Building2,
  Sparkles,
  KeyRound,
  FileSpreadsheet,
  Award,
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
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  University Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">EthioCred Academic Trust Registry</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-navy-950 transition-colors">Issuance Workflow</a>
            <a href="#security" className="hover:text-navy-950 transition-colors">Cryptographic Rigor</a>
            <a href="#features" className="hover:text-navy-950 transition-colors">Registrar Tools</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2 text-xs font-semibold text-white shadow-soft hover:bg-navy-800 transition-all focus-ring active:scale-98"
            >
              <span>Registrar Sign In</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200/80">
        <div className="absolute top-0 right-1/4 -mt-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -ml-24 h-96 w-96 rounded-full bg-navy-500/10 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-900 shadow-2xs">
                <GraduationCap size={14} className="text-amber-700" />
                <span>National Higher Education Credential Authority</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-navy-950 font-display leading-[1.12]">
                Issue Cryptographically Signed Degrees. <br className="hidden sm:inline" />
                <span className="text-amber-700">Zero Paperwork.</span> Zero Fraud.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                The institutional issuing authority for Ethiopian universities. Upload graduating batches via CSV, stage and review records, and digitally sign credentials with RSA-2048 keys anchored in the EthioCred Trust Registry.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white shadow-soft hover:bg-navy-800 transition-all focus-ring active:scale-98"
                >
                  <GraduationCap size={18} />
                  <span>Access Registrar Console</span>
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-soft hover:bg-slate-50 hover:text-slate-900 transition-all focus-ring"
                >
                  <span>Explore Batch Ingestion</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-2xl font-extrabold text-navy-950 font-display tabular-nums">Batch CSV</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Automated Validation</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-navy-950 font-display tabular-nums">RSA-2048</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Private Key Stamping</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-navy-950 font-display tabular-nums">100%</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Fayda ID Match</p>
                </div>
              </div>
            </div>

            {/* Right Column: CSS Batch Upload & Staging Preview */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="rounded-2xl border-2 border-slate-300/90 bg-white p-6 shadow-certificate space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                        <FileSpreadsheet size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy-950 font-display">CS_Graduation_Class_2024.csv</p>
                        <p className="text-[10px] text-slate-400">Batch #7802 · 142 Records Staged</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                      100% VALIDATED
                    </span>
                  </div>

                  {/* Staged Rows Sample */}
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">Abebe Bekele Tessema</p>
                        <p className="text-[10px] font-mono text-slate-400">FAYDA-001 · Software Eng</p>
                      </div>
                      <span className="font-bold text-navy-900 tabular-nums">3.89 GPA</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">Almaz Hailemariam</p>
                        <p className="text-[10px] font-mono text-slate-400">FAYDA-042 · Computer Sci</p>
                      </div>
                      <span className="font-bold text-navy-900 tabular-nums">3.95 GPA</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">Dawit Yohannes</p>
                        <p className="text-[10px] font-mono text-slate-400">FAYDA-108 · Information Sys</p>
                      </div>
                      <span className="font-bold text-navy-900 tabular-nums">3.72 GPA</span>
                    </div>
                  </div>

                  {/* Signing Preview Bar */}
                  <div className="rounded-xl bg-navy-950 p-4 text-white text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                        <KeyRound size={14} />
                        <span>Ready for RSA Digital Signing</span>
                      </div>
                      <span className="text-[10px] text-slate-400">AAU Root Key #704</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Signing will canonicalize data, compute SHA-256 digests, and deposit signed certificates into student wallets.
                    </p>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-4 rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur p-3 shadow-hover flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">Instant Wallet Deposit</p>
                    <p className="text-[11px] text-slate-500">Available to students immediately</p>
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
              <Sparkles size={13} /> The 3-Step Issuance Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-display tracking-tight">
              Streamlined Graduation Ingestion
            </h2>
            <p className="text-base text-slate-500">
              Eliminate paper transcript backlogs with automated cryptographic batch processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border-2 border-amber-500/80 bg-white p-8 shadow-card ring-4 ring-amber-50 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-extrabold text-amber-700">STEP 01</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shadow-soft my-5">
                  <UploadCloud size={24} />
                </div>
                <h3 className="text-xl font-bold text-navy-950 font-display mb-2">Upload Batch CSV</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Export graduation data from your student information system. Upload the CSV directly; the platform validates schemas, names, and Fayda IDs.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-amber-800">
                <CheckCircle2 size={16} />
                <span>Pre-flight Staging Validation</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-8 shadow-soft flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-extrabold text-slate-400">STEP 02</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-white shadow-soft my-5">
                  <FileCheck2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-navy-950 font-display mb-2">Inspect & Stage</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Review valid vs invalid records before signing. Ensure every student’s GPA, degree, and major match official Senate graduation approvals.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-navy-900">
                <CheckCircle2 size={16} />
                <span>Row-by-Row Error Filtering</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-8 shadow-soft flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-extrabold text-slate-400">STEP 03</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-soft my-5">
                  <Award size={24} />
                </div>
                <h3 className="text-xl font-bold text-navy-950 font-display mb-2">Sign & Distribute</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Trigger RSA-2048 signing with a single click. Certificates are sealed, registered, and instantly dispatched to graduates' digital wallets.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={16} />
                <span>Non-Repudiable Digital Signature</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Specific CTA */}
      <section className="py-16 sm:py-20 bg-navy-950 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight">
            Accredited University Registrar Sign In
          </h2>
          <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Authorized personnel can sign in to stage batches, manage public keys, and oversee credential issuance.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-3.5 text-sm font-semibold text-white shadow-soft hover:bg-amber-500 transition-all focus-ring"
            >
              <GraduationCap size={18} />
              <span>Enter Registrar Console</span>
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
              <p className="font-bold text-slate-900 font-display">EthioCred University Registrar Grid</p>
              <p className="text-[11px] text-slate-400">Federal Democratic Republic of Ethiopia</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-slate-600">
            <a href="http://localhost:5173" className="hover:text-navy-950 transition-colors">Student Wallet</a>
            <a href="http://localhost:5175" className="hover:text-navy-950 transition-colors">Employer Portal</a>
            <a href="http://localhost:5176" className="hover:text-navy-950 transition-colors">National Trust Registry</a>
          </div>

          <p className="text-slate-400">
            &copy; 2026 EthioCred. Ministry of Education accredited.
          </p>
        </div>
      </footer>
    </div>
  );
}
