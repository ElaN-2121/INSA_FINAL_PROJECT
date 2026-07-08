import { useCallback, useEffect, useState } from 'react';
import { Link2 } from 'lucide-react';
import { get, del, formatDate } from '@ethiocred/utils';
import Badge from '../../components/Badge/Badge.jsx';
import Loader from '../../components/Loader/Loader.jsx';

export default function ShareLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLinks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await get('/share-links/mine');
      setLinks(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load share links');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const handleRevoke = async (linkId) => {
    if (!window.confirm('Revoke this share link? Anyone with the URL will no longer be able to verify.')) {
      return;
    }
    try {
      await del(`/share-links/${linkId}`);
      await loadLinks();
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
          <Link2 size={24} className="text-blue-700" />
          Share Links
        </h2>
        <p className="mt-1 text-sm text-gray-500">Manage time-limited verification links across all your credentials.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-medium">Credential</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Views</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    No share links yet. Generate one from a credential detail page.
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link.id} className="border-b border-gray-100">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{link.degree_name}</p>
                      <p className="text-xs text-gray-500">{link.serial_number}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(link.created_at)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(link.expires_at)}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {link.view_count}
                      {link.max_views != null ? ` / ${link.max_views}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      {link.is_active && new Date(link.expires_at) > new Date() ? (
                        <Badge variant="green">Active</Badge>
                      ) : (
                        <Badge variant="red">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {link.is_active && (
                        <button
                          type="button"
                          onClick={() => handleRevoke(link.id)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
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
      </div>
    </div>
  );
}
