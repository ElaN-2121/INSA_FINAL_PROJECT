import { useCallback, useEffect, useState } from 'react';
import { Copy, X } from 'lucide-react';
import { get, post, del } from '../../services/api.js';
import Badge from '../Badge/Badge.jsx';
import Loader from '../Loader/Loader.jsx';
import { formatDate } from '../../utils/formatDate.js';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500';

const btnPrimary =
  'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';

const btnSecondary =
  'rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500';

const btnDestructive =
  'rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';

export default function ApiKeysModal({ institution, onClose }) {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [label, setLabel] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [newKeyDisplay, setNewKeyDisplay] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await get(`/admin/institutions/${institution.id}/api-keys`);
      setKeys(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }, [institution.id]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!label.trim()) return;

    setGenerating(true);
    setError('');
    try {
      const payload = { label: label.trim() };
      if (expiresAt) {
        payload.expiresAt = new Date(expiresAt).toISOString();
      }
      const { data } = await post(`/admin/institutions/${institution.id}/api-keys`, payload);
      setNewKeyDisplay(data.data);
      setLabel('');
      setExpiresAt('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate API key');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (keyId, keyLabel) => {
    if (!window.confirm(`Revoke API key "${keyLabel}"? This cannot be undone.`)) {
      return;
    }
    setError('');
    try {
      await del(`/admin/institutions/${institution.id}/api-keys/${keyId}`);
      await loadKeys();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to revoke API key');
    }
  };

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dismissNewKey = async () => {
    setNewKeyDisplay(null);
    setCopied(false);
    await loadKeys();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={newKeyDisplay ? undefined : onClose} aria-hidden="true" />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
            <p className="text-sm text-gray-500">{institution.name}</p>
          </div>
          {!newKeyDisplay && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {newKeyDisplay ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <strong>Warning:</strong> This key will NOT be shown again. Copy it now and provide it securely to
                the institution&apos;s technical team.
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Full API Key (one-time)
                </label>
                <div className="mt-2 flex items-start gap-2">
                  <code className="flex-1 break-all rounded-xl bg-gray-900 px-4 py-4 font-mono text-sm text-emerald-300">
                    {newKeyDisplay.fullKey}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(newKeyDisplay.fullKey)}
                    className="rounded-xl border border-gray-300 bg-white p-3 hover:bg-gray-50"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                {copied && <p className="mt-1 text-xs text-green-600">Copied to clipboard!</p>}
              </div>
              <button type="button" onClick={dismissNewKey} className={`w-full ${btnPrimary}`}>
                I have saved this key
              </button>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                        <th className="pb-3 pr-4 font-medium">Label</th>
                        <th className="pb-3 pr-4 font-medium">Key Prefix</th>
                        <th className="pb-3 pr-4 font-medium">Created</th>
                        <th className="pb-3 pr-4 font-medium">Expires</th>
                        <th className="pb-3 pr-4 font-medium">Last Used</th>
                        <th className="pb-3 pr-4 font-medium">Status</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keys.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500">
                            No API keys yet.
                          </td>
                        </tr>
                      ) : (
                        keys.map((key) => (
                          <tr key={key.id} className="border-b border-gray-100">
                            <td className="py-3 pr-4 font-medium text-gray-900">{key.label || '—'}</td>
                            <td className="py-3 pr-4 font-mono text-gray-600">{key.key_prefix}...</td>
                            <td className="py-3 pr-4 text-gray-600">{formatDate(key.created_at)}</td>
                            <td className="py-3 pr-4 text-gray-600">
                              {key.expires_at ? formatDate(key.expires_at) : 'Never'}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">
                              {key.last_used_at ? formatDate(key.last_used_at) : 'Never'}
                            </td>
                            <td className="py-3 pr-4">
                              {key.is_active ? (
                                <Badge variant="green">Active</Badge>
                              ) : (
                                <Badge variant="red">Revoked</Badge>
                              )}
                            </td>
                            <td className="py-3">
                              {key.is_active && (
                                <button
                                  type="button"
                                  onClick={() => handleRevoke(key.id, key.label)}
                                  className={btnDestructive}
                                >
                                  Revoke
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h4 className="text-sm font-semibold text-gray-900">+ Generate New API Key</h4>
                <form onSubmit={handleGenerate} className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Label</label>
                    <input
                      required
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="SIS Integration"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Expiry Date (optional)
                    </label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <button type="submit" disabled={generating} className={btnPrimary}>
                    {generating ? 'Generating…' : 'Generate Key'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {!newKeyDisplay && (
          <div className="border-t border-gray-200 px-6 py-4">
            <button type="button" onClick={onClose} className={btnSecondary}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
