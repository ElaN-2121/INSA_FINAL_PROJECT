import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Eye } from 'lucide-react';
import { get, formatDateTime } from '@ethiocred/utils';
import Badge from '../../components/Badge/Badge.jsx';
import Loader from '../../components/Loader/Loader.jsx';

export default function VerificationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    get('/credentials/mine/verification-history')
      .then(({ data }) => setHistory(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load verification history'))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalVerifications = history.reduce((sum, item) => sum + (item.verifications?.length || 0), 0);

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
          <Eye size={24} className="text-blue-700" />
          Who Has Verified My Credentials
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          This shows every time an employer has verified one of your credentials through EthioCred.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {totalVerifications === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <Eye className="mx-auto mb-4 text-gray-300" size={48} />
          <p className="text-gray-600">
            No one has verified your credentials yet. Share your credentials with employers to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
            const isOpen = expanded[item.credential.id] ?? true;
            const verifications = item.verifications || [];

            return (
              <div key={item.credential.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleExpanded(item.credential.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <div>
                      <p className="font-semibold text-gray-900">{item.credential.degree_name}</p>
                      <p className="text-sm text-gray-500">{item.credential.institution_name}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{verifications.length} verification(s)</span>
                </button>

                {isOpen && verifications.length > 0 && (
                  <div className="border-t border-gray-100 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-5 py-2 font-medium">Employer Name</th>
                          <th className="px-5 py-2 font-medium">Company</th>
                          <th className="px-5 py-2 font-medium">Verified At</th>
                          <th className="px-5 py-2 font-medium">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verifications.map((log) => (
                          <tr key={log.id} className="border-t border-gray-100">
                            <td className="px-5 py-3 text-gray-900">{log.employer_name || '—'}</td>
                            <td className="px-5 py-3 text-gray-600">{log.company_name || '—'}</td>
                            <td className="px-5 py-3 text-gray-600">{formatDateTime(log.checked_at)}</td>
                            <td className="px-5 py-3">
                              {log.result === 'VALID' ? (
                                <Badge variant="green">VALID</Badge>
                              ) : (
                                <Badge variant="red">{log.result}</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
