import { Shield, KeyRound, CheckCircle2, Lock } from 'lucide-react';
import mark from '../assets/mark.png';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans">
      {/* Brand & Trust Panel - Left side on desktop */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between bg-navy-950 p-12 text-white overflow-hidden border-r border-navy-900">
        {/* Subtle decorative background watermark */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 opacity-5 pointer-events-none">
          <img src={mark} alt="" className="w-full h-full object-contain filter invert" />
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img
              src={mark}
              alt="EthioCred"
              className="h-11 w-11 rounded-xl object-contain p-1 bg-white/10 backdrop-blur border border-white/20 shadow-soft"
            />
            <div>
              <span className="text-xl font-bold font-display tracking-tight text-white">EthioCred</span>
              <p className="text-xs text-slate-400 font-medium">Federal Academic Trust Platform</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 my-auto py-12 max-w-lg">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 shadow-soft mb-6">
            <Shield size={14} /> Student Credential Wallet
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight leading-tight text-white">
            Your Academic Identity, Cryptographically Secured.
          </h2>

          <p className="mt-4 text-base text-slate-300 leading-relaxed font-sans">
            Store RSA-signed degrees from Ethiopian universities, manage employer verification requests with complete consent, and share verifiable credentials globally.
          </p>

          <div className="mt-8 space-y-4 pt-6 border-t border-navy-800/80">
            <div className="flex items-start gap-3 text-sm text-slate-200">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Fayda National ID Integration:</strong> Authenticate seamlessly using your national Fayda identity.</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-slate-200">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Student-Controlled Access:</strong> No employer or third-party can inspect your records without explicit approval.</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-slate-200">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Instant QR Verification:</strong> Generate digitally signed QR codes for fast verification.</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-navy-900">
          <span>Protected by RSA-2048 & SHA-256</span>
          <span>Federal Democratic Republic of Ethiopia</span>
        </div>
      </div>

      {/* Form Area - Right side on desktop */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Header */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-soft mb-3 p-1">
              <img src={mark} alt="EthioCred" className="h-full w-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-950 font-display">EthioCred</h1>
            <p className="mt-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Student Credential Wallet
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card">
            {children}
          </div>

          <div className="mt-8 text-center text-xs text-slate-400 lg:hidden">
            <p>Federal Democratic Republic of Ethiopia</p>
            <p className="mt-0.5">National Academic Credential Trust Authority</p>
          </div>
        </div>
      </div>
    </div>
  );
}
