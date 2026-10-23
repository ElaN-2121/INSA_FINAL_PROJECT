import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  Download,
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  Award,
  Hash,
  KeyRound,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { get, formatDate } from '@ethiocred/utils';
import { Button, Badge, Card, Loader } from '@ethiocred/ui';
import mark from '../../assets/mark.png';

export default function CredentialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    get(`/credentials/${id}`)
      .then(({ data }) => setCredential(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load credential'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!credential || !canvasRef.current) return;

    // Use environment variable with sensible fallback to avoid hardcoding localhost
    const apiBase =
      import.meta.env.VITE_PUBLIC_VERIFY_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000` : 'http://localhost:5000');

    const qrPayload = JSON.stringify({
      credentialId: credential.id,
      serialNumber: credential.serial_number,
      verifyUrl: `${apiBase}/api/verification/verify/${credential.id}`,
    });

    QRCode.toCanvas(canvasRef.current, qrPayload, {
      width: 220,
      margin: 2,
      color: {
        dark: '#0F274A',
        light: '#FFFFFF',
      },
    }).catch(() => {});
  }, [credential]);

  const handleDownloadQr = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `ethiocred-qr-${credential.serial_number}.png`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySerial = () => {
    if (!credential?.serial_number) return;
    navigator.clipboard?.writeText(credential.serial_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader size="lg" color="text-emerald-600" />
        <p className="text-sm font-semibold text-slate-500">Loading verifiable credential...</p>
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center border border-red-200">
          <ShieldCheck size={24} />
        </div>
        <h3 className="text-lg font-bold text-navy-950 font-display">Credential Not Found</h3>
        <p className="text-sm text-slate-500">{error || 'This credential could not be retrieved from the registry.'}</p>
        <Button
          type="button"
          variant="outline"
          size="md"
          leftIcon={ArrowLeft}
          onClick={() => navigate('/credentials')}
        >
          Back to credentials
        </Button>
      </div>
    );
  }

  const isActive = credential.status === 'ACTIVE';

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Print CSS styling */}
      <style>{`
        @media print {
          header, aside, button, nav, .no-print { display: none !important; }
          body, main { background: white !important; padding: 0 !important; }
          .certificate-print { border: 2px solid #0F274A !important; box-shadow: none !important; }
        }
      `}</style>

      {/* Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <button
          type="button"
          onClick={() => navigate('/credentials')}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-navy-900 transition-colors focus-ring rounded-lg px-1 py-0.5"
        >
          <ArrowLeft size={14} />
          <span>Back to Credentials</span>
        </button>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={Printer}
            onClick={handlePrint}
          >
            Print Certificate
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            leftIcon={Download}
            onClick={handleDownloadQr}
            className="bg-navy-900 hover:bg-navy-800 text-white"
          >
            Download QR
          </Button>
        </div>
      </div>

      {/* Main Grid: Certificate on Left, QR Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Premium Digital Certificate Card */}
        <div className="lg:col-span-7">
          <div className="certificate-print relative rounded-3xl border-2 border-slate-300 bg-white p-8 sm:p-10 shadow-certificate overflow-hidden">
            {/* National Crest Watermark */}
            <div className="absolute right-[-40px] bottom-[-40px] w-72 h-72 opacity-[0.035] pointer-events-none">
              <img src={mark} alt="" className="w-full h-full object-contain" />
            </div>

            {/* Guilloche Ribbon Header */}
            <div className="h-2 w-full bg-gradient-to-r from-emerald-600 via-amber-500 to-navy-900 rounded-full mb-6" />

            {/* Institution & Seal Top Bar */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <img
                  src={mark}
                  alt="EthioCred"
                  className="h-12 w-12 object-contain p-1 rounded-xl bg-slate-50 border border-slate-200"
                />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-display">
                    Federal Democratic Republic of Ethiopia
                  </p>
                  <h3 className="text-sm sm:text-base font-extrabold text-navy-950 font-display">
                    {credential.institution_name}
                  </h3>
                  <p className="text-[11px] text-slate-500">Ministry of Education Accredited Institution</p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive ? 'bg-emerald-600 animate-pulse' : 'bg-red-600'
                  }`}
                />
                {credential.status}
              </span>
            </div>

            {/* Conferred Degree Announcement */}
            <div className="py-8 space-y-4 text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Official Certification of Academic Degree
              </p>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display tracking-tight leading-tight">
                  {credential.degree_name}
                </h2>
                {credential.major && (
                  <p className="text-sm font-semibold text-slate-600 mt-1">
                    Major in {credential.major}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <p className="text-xs text-slate-400 font-medium">Conferred to:</p>
                <p className="text-lg sm:text-xl font-bold text-navy-900 font-display mt-0.5">
                  {credential.holder_name}
                </p>
                {credential.fayda_id && (
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    Fayda National ID: {credential.fayda_id}
                  </p>
                )}
              </div>

              {/* Academic Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Cumulative GPA</p>
                  <p className="text-base font-extrabold text-navy-950 font-display mt-0.5 tabular-nums">
                    {credential.gpa} / 4.00
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Graduation Year</p>
                  <p className="text-base font-extrabold text-navy-950 font-display mt-0.5">
                    {credential.graduation_year}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Issue Date</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">
                    {formatDate(credential.issue_date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Footer: Cryptographic Signature Hash */}
            <div className="border-t border-slate-100 bg-slate-50/70 -mx-8 -mb-8 sm:-mx-10 sm:-mb-10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">RSA-2048 Asymmetric Digital Signature</p>
                  <p className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
                    Serial: {credential.serial_number}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopySerial}
                className="text-[11px] font-semibold text-navy-900 hover:underline no-print focus-ring rounded"
              >
                {copied ? 'Serial Copied ✓' : 'Copy Serial'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Scannable QR Code & Access Controls */}
        <div className="lg:col-span-5 space-y-6 no-print">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card text-center space-y-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-navy-50 text-navy-800 border border-navy-200">
                <ShieldCheck size={14} className="text-emerald-600" />
                Instant Verification QR
              </span>
              <h3 className="text-lg font-bold text-navy-950 font-display tracking-tight mt-2">
                Scan to Verify Authenticity
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                Employers, embassies, and academic institutions can scan this QR code with any smartphone to run instant cryptographic verification.
              </p>
            </div>

            {/* QR Canvas Container */}
            <div className="inline-flex p-4 rounded-2xl bg-white border border-slate-200 shadow-soft ring-4 ring-slate-50">
              <canvas ref={canvasRef} className="rounded-lg" />
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="button"
                variant="primary"
                size="md"
                leftIcon={Download}
                onClick={handleDownloadQr}
                className="w-full bg-navy-900 hover:bg-navy-800 text-white"
              >
                Download Verification QR
              </Button>

              <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-100 text-left space-y-1">
                <p className="font-semibold text-slate-700">QR Payload Details:</p>
                <p className="truncate font-mono text-[10px]">Credential: {credential.id}</p>
                <p className="truncate font-mono text-[10px]">Serial: {credential.serial_number}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
