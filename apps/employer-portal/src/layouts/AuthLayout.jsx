import mark from '../assets/mark.png';

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200/80 shadow-card mb-4 p-1">
            <img
              src={mark}
              alt="EthioCred"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950 font-display">EthioCred</h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 mt-2">
            Employer Verification Portal
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-card">
          {children}
        </div>
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>Instant Cryptographic Background Checks</p>
          <p className="mt-1">Federal Democratic Republic of Ethiopia</p>
        </div>
      </div>
    </div>
  );
}
