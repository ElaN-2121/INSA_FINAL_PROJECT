import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import { get, formatDate } from '@ethiocred/utils';
import Badge from '../../components/Badge/Badge.jsx';
import Loader from '../../components/Loader/Loader.jsx';

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
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error || 'Credential not found'}</p>
        <button type="button" onClick={() => navigate('/credentials')} className="text-blue-600 hover:underline">
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
    <div>
      <button
        type="button"
        onClick={() => navigate('/credentials')}
        className="text-sm text-blue-600 hover:underline mb-4"
      >
        ← Back to credentials
      </button>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Credential Detail</h2>
        {statusBadge(credential.status)}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.label}>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{f.label}</p>
              <p className="text-gray-800 font-medium mt-0.5">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">QR Code</h3>
        <p className="text-sm text-gray-500 mb-4">
          Scan this code to verify this credential. Contains credential ID and verification URL.
        </p>
        <div className="flex flex-col items-center gap-4">
          <canvas ref={canvasRef} className="border border-gray-200 rounded-lg" />
          <button
            type="button"
            onClick={handleDownloadQr}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Download size={16} />
            Download QR
          </button>
        </div>
      </div>
    </div>
  );
}
