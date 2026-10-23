import { Badge, Loader } from '@ethiocred/ui';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { ArrowLeft, Download } from 'lucide-react';
import { get, formatDate } from '@ethiocred/utils';

function statusBadge(status) {
  if (status === 'ACTIVE') return <Badge variant="green">ACTIVE</Badge>;
  if (status === 'REVOKED') return <Badge variant="red">REVOKED</Badge>;
  return <Badge variant="gray">{status}</Badge>;
}

export default function CredentialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    get(`/credentials/${id}`)
      .then(({ data }) => setCredential(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load credential'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!credential || !canvasRef.current) return;

    const qrPayload = JSON.stringify({
      credentialId: credential.id,
      serialNumber: credential.serial_number,
      verifyUrl: `http://localhost:5000/api/verification/verify/${credential.id}`,
    });

    QRCode.toCanvas(canvasRef.current, qrPayload, { width: 200, margin: 2 }).catch(() => {});
  }, [credential]);

  const handleDownloadQr = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `credential-${credential.serial_number}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-red-600">{error || 'Credential not found'}</p>
        <button
          type="button"
          onClick={() => navigate('/credentials')}
          className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 focus:outline-none focus:underline"
        >
          Back to credentials
        </button>
      </div>
    );
  }

  const fields = [
    { label: 'Serial Number', value: credential.serial_number },
    { label: 'Degree', value: credential.degree_name },
    { label: 'Major', value: credential.major || '—' },
    { label: 'Institution', value: credential.institution_name },
    { label: 'Graduation Year', value: credential.graduation_year },
    { label: 'GPA', value: credential.gpa },
    { label: 'Issue Date', value: formatDate(credential.issue_date) },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <button
        type="button"
        onClick={() => navigate('/credentials')}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 focus:outline-none focus:underline"
      >
        <ArrowLeft size={16} />
        Back to credentials
      </button>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Credential Detail</h2>
          <p className="mt-1 text-sm text-gray-500">{credential.degree_name}</p>
        </div>
        {statusBadge(credential.status)}
      </div>

      <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            Credential Information
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          {fields.map((f) => (
            <div key={f.label}>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{f.label}</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">QR Code</h3>
          <p className="mt-1 text-sm text-gray-500">
            Scan this code to verify this credential. Contains credential ID and verification URL.
          </p>
        </div>
        <div className="flex flex-col items-center gap-5 p-8">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-inner">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>
          <button
            type="button"
            onClick={handleDownloadQr}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Download size={16} />
            Download QR
          </button>
        </div>
      </div>
    </div>
  );
}
