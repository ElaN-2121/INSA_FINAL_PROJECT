import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileCheck2, ShieldOff, BarChart3, Trophy } from 'lucide-react';
import logo from '../../assets/logo.png';

const steps = [
  { icon: Upload, title: 'Upload a batch', text: 'Import graduating students via CSV and review records in staging.' },
  { icon: FileCheck2, title: 'Issue credentials', text: 'Digitally sign each credential with your institution\'s private key.' },
  { icon: ShieldOff, title: 'Revoke when needed', text: 'Invalidate compromised or incorrect credentials with a full audit trail.' },
  { icon: BarChart3, title: 'Track issuance', text: 'Monitor issued credentials and verification activity from your dashboard.' },
];

export default function Landing() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const fade = () =>
    `transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`;

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
              to="/leaderboard"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-700"
            >
              Rankings
            </Link>
            <Link
              to="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <section className={`bg-gradient-to-br from-blue-600 to-indigo-700 px-4 py-16 text-white sm:px-6 sm:py-24 ${fade()}`}>
        <div className="mx-auto max-w-4xl text-center">
          <img src={logo} alt="EthioCred logo" className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-white/10 p-2 object-contain" />
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">EthioCred University Portal</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100 sm:text-xl">
            Issue tamper-proof digital credentials your graduates can trust.
          </p>
          <div className="mt-8">
            <Link
              to="/login"
              className="inline-block rounded-lg bg-white px-8 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      <section className={`mx-auto max-w-6xl px-4 py-16 sm:px-6 ${fade()}`}>
        <h2 className="text-2xl font-semibold text-gray-900">What is EthioCred?</h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600">
          Traditional certificate verification is manual, repetitive, and vulnerable to fraud.
          EthioCred gives authorized universities a secure way to issue RSA-signed digital credentials,
          register in a trusted institution network, and let graduates and employers verify authenticity
          without endless phone calls or email chains.
        </p>
      </section>

      <section className={`mx-auto max-w-6xl px-4 pb-8 sm:px-6 ${fade()}`}>
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Trophy size={22} className="text-indigo-600" />
              National Credential Rankings
            </h2>
            <p className="mt-2 max-w-xl text-sm text-gray-600">
              See how your graduates compare nationally — employer verifications, credentials issued, and more.
            </p>
          </div>
          <Link
            to="/leaderboard"
            className="mt-4 inline-block shrink-0 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:mt-0"
          >
            View Rankings
          </Link>
        </div>
      </section>

      <section className={`bg-white px-4 py-16 sm:px-6 ${fade()}`}>
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600">
            We aim to create a trustworthy digital credential ecosystem — where your institution
            signs credentials with confidence, graduates carry them securely, and employers verify
            them instantly through cryptographic proof rather than visual inspection.
          </p>
        </div>
      </section>

      <section className={`mx-auto max-w-6xl px-4 py-16 sm:px-6 ${fade()}`}>
        <h2 className="mb-10 text-center text-2xl font-semibold text-gray-900">How It Works</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
            <p className="mt-1 text-sm text-gray-400">Secure credential issuance for universities.</p>
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
