import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Wallet, Link2, Eye, FileDown, Bell } from 'lucide-react';
import logo from '../../assets/logo.png';

const steps = [
  { icon: Wallet, title: 'Receive credentials', text: 'Universities issue digitally signed credentials directly to your wallet.' },
  { icon: Shield, title: 'Control access', text: 'Approve or deny employer verification requests before anyone sees your data.' },
  { icon: Link2, title: 'Shareable links', text: 'Generate time-limited verification links anyone can use — no account required.' },
  { icon: Eye, title: 'Verification history', text: 'See who verified your credentials and when, with full employer details.' },
  { icon: FileDown, title: 'Download PDFs', text: 'Export a visual credential certificate for your records or sharing.' },
  { icon: Bell, title: 'Stay informed', text: 'Get notified when someone requests access to your academic records.' },
];

export default function Landing() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const fade = (delay = 0) =>
    `transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`
    + (delay ? ` delay-[${delay}ms]` : '');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="EthioCred logo" className="h-10 w-10 rounded-lg object-contain" />
            <span className="text-lg font-semibold text-gray-900">EthioCred</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <section className={`bg-gradient-to-br from-blue-600 to-indigo-700 px-4 py-16 text-white sm:px-6 sm:py-24 ${fade()}`}>
        <div className="mx-auto max-w-4xl text-center">
          <img src={logo} alt="EthioCred logo" className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-white/10 p-2 object-contain" />
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">EthioCred User Wallet</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100 sm:text-xl">
            Your academic credentials, secured and always in your control.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/login"
              className="w-full rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white sm:w-auto"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="w-full rounded-lg border-2 border-white/80 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white sm:w-auto"
            >
              Register
            </Link>
          </div>
        </div>
      </section>

      <section className={`mx-auto max-w-6xl px-4 py-16 sm:px-6 ${fade()}`}>
        <h2 className="text-2xl font-semibold text-gray-900">What is EthioCred?</h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600">
          Paper certificates are slow to verify and easy to forge. EthioCred replaces manual checks with
          a digital platform where universities cryptographically sign every credential, graduates store
          them in a personal wallet, and employers verify authenticity in seconds — not weeks.
        </p>
      </section>

      <section className={`bg-white px-4 py-16 sm:px-6 ${fade()}`}>
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600">
            We are building a secure, scalable ecosystem where educational institutions issue
            tamper-proof credentials, graduates manage them with confidence, and employers can trust
            what they see — backed by mathematics, not paperwork.
          </p>
        </div>
      </section>

      <section className={`mx-auto max-w-6xl px-4 py-16 sm:px-6 ${fade()}`}>
        <h2 className="mb-10 text-center text-2xl font-semibold text-gray-900">How It Works</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <span className="text-sm font-bold">{index + 1}</span>
              </div>
              <step.icon size={24} className="mb-3 text-blue-600" />
              <h3 className="font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-gray-900 px-4 py-10 text-gray-300 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">EthioCred</p>
            <p className="mt-1 text-sm text-gray-400">Secure digital credential wallet for graduates.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Contact Us</p>
            {/* Placeholder contact details — replace when real info is available */}
            <p className="mt-2 text-sm">
              <a href="mailto:contact@ethiocred.et" className="text-blue-400 hover:text-blue-300">
                contact@ethiocred.et
              </a>
            </p>
            <p className="mt-1 text-sm text-gray-400">Addis Ababa, Ethiopia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
