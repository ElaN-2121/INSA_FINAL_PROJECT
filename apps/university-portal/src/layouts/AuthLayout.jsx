import logo from '../assets/Gemini_Generated_Image_pguz57pguz57pguz.png';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_25%)]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-4 rounded-3xl bg-white/10 p-5 shadow-xl backdrop-blur-xl border border-white/10">
          <img
            src={logo}
            alt="EthioCred logo"
            className="h-12 w-12 rounded-2xl border border-white/20 bg-white/10"
          />
          <div>
            <h1 className="text-3xl font-semibold text-white">EthioCred</h1>
            <p className="text-sm text-slate-200">Secure university credential management</p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-50 opacity-70" />
          <div className="relative p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
