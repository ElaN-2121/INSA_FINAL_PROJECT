import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { ArrowLeft, Copy, Download, FileDown, Link2 } from 'lucide-react';
import { api, get, post, del, formatDate } from '@ethiocred/utils';
import Badge from '../../components/Badge/Badge.jsx';
import Loader from '../../components/Loader/Loader.jsx';

const EXPIRY_OPTIONS = [
  { label: '24 hours', hours: 24 },
  { label: '48 hours', hours: 48 },
  { label: '72 hours', hours: 72 },
  { label: '7 days', hours: 168 },
];

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
  const [shareLinks, setShareLinks] = useState([]);
  const [expiresInHours, setExpiresInHours] = useState(48);
  const [maxViews, setMaxViews] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const loadShareLinks = useCallback(async () => {
    try {
      const { data } = await get('/share-links/mine');
      const all = data.data || [];
      setShareLinks(all.filter((link) => link.credential_id === id));
    } catch {
      setShareLinks([]);
    }
  }, [id]);

  useEffect(() => {
    get(`/credentials/${id}`)
      .then(({ data }) => setCredential(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load credential'))
      .finally(() => setLoading(false));
    loadShareLinks();
  }, [id, loadShareLinks]);

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

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const response = await api.get(`/credentials/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `credential-${credential.serial_number}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleGenerateLink = async () => {
    setGeneratingLink(true);
    setError('');
    try {
      const payload = {
        credentialId: id,
        expiresInHours: Number(expiresInHours),
      };
      if (maxViews !== '' && maxViews != null) {
        payload.maxViews = Number(maxViews);
      }
      const { data } = await post('/share-links', payload);
      setGeneratedLink(data.data);
      await loadShareLinks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate share link');
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyShareUrl = async (url) => {
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleRevokeLink = async (linkId) => {
    if (!window.confirm('Revoke this share link?')) return;
    try {
      await del(`/share-links/${linkId}`);
      setGeneratedLink(null);
      await loadShareLinks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to revoke link');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (error && !credential) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/credentials')}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
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

  const activeLinks = shareLinks.filter((l) => l.is_active && new Date(l.expires_at) > new Date());

  return (
    <div className="mx-auto max-w-4xl">
      <button
        type="button"
        onClick={() => navigate('/credentials')}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
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

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Credential Information</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          {fields.map((f) => (
            <div key={f.label}>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{f.label}</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{f.value}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <FileDown size={16} />
            {downloadingPdf ? 'Downloading…' : 'Download PDF'}
          </button>
          <p className="mt-2 text-xs text-gray-500">
            This PDF is a visual representation only. Cryptographic verification always takes precedence.
            Share the Credential ID or a Shareable Link for tamper-proof verification.
          </p>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">QR Code</h3>
        </div>
        <div className="flex flex-col items-center gap-5 p-8">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-inner">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>
          <button
            type="button"
            onClick={handleDownloadQr}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Download size={16} />
            Download QR
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
            <Link2 size={16} />
            Shareable Verification Link
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Generate a time-limited link that anyone can use to verify this credential, without needing an EthioCred account.
          </p>
        </div>
        <div className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Expiry</label>
              <select
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EXPIRY_OPTIONS.map((opt) => (
                  <option key={opt.hours} value={opt.hours}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Max views (optional)</label>
              <input
                type="number"
                min="1"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                placeholder="Unlimited"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateLink}
            disabled={generatingLink}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {generatingLink ? 'Generating…' : 'Generate Link'}
          </button>

          {generatedLink && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="mb-2 text-sm font-medium text-green-800">
                Link generated — expires in {expiresInHours} hours
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={generatedLink.shareUrl}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => copyShareUrl(generatedLink.shareUrl)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 hover:bg-gray-50"
                >
                  <Copy size={16} />
                </button>
              </div>
              {linkCopied && <p className="mt-1 text-xs text-green-600">Copied!</p>}
            </div>
          )}

          {activeLinks.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Active links for this credential</h4>
              <ul className="space-y-2">
                {activeLinks.map((link) => (
                  <li
                    key={link.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="text-gray-600">Expires {formatDate(link.expires_at)}</p>
                      <p className="text-gray-500">{link.view_count} view(s)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevokeLink(link.id)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                    >
                      Revoke
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
