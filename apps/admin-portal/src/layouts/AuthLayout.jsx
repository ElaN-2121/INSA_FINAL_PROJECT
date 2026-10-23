import mark from '../assets/mark.png';

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-navy-950 to-slate-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur border border-white/20 shadow-card mb-4 p-1">
            <img
              src={mark}
              alt="EthioCred"
              className="h-full w-full object-contain drop-shadow"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">EthioCred</h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-sky-400 bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-800/60 mt-2">
            National Trust Registry Admin
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 backdrop-blur p-8 shadow-card text-white">
          {children}
        </div>
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>Authorized Personnel Only · Cryptographic Trust Root</p>
          <p className="mt-1">Federal Democratic Republic of Ethiopia</p>
        </div>
      </div>
    </div>
  );
}
