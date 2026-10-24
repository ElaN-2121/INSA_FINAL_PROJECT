import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  Filter,
  Calendar,
  Building2,
  FileCheck2,
  QrCode,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { get, formatDate } from '@ethiocred/utils';
import { Badge, Loader, EmptyState, PageHeader, SearchInput } from '@ethiocred/ui';

function statusBadge(status) {
  if (status === 'ACTIVE') return <Badge variant="green">ACTIVE</Badge>;
  if (status === 'REVOKED') return <Badge variant="red">REVOKED</Badge>;
  return <Badge variant="gray">{status}</Badge>;
}

export default function Credentials() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    get('/credentials/mine')
      .then(({ data }) => setCredentials(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load credentials'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return credentials.filter((c) => {
      const matchesSearch =
        !q ||
        c.degree_name?.toLowerCase().includes(q) ||
        c.institution_name?.toLowerCase().includes(q) ||
        c.major?.toLowerCase().includes(q) ||
        c.serial_number?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'ALL' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [credentials, search, statusFilter]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Digital Credentials"
        description="Tamper-evident diplomas and degrees cryptographically signed by accredited universities."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Records: {credentials.length}
            </span>
          </div>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="w-full sm:max-w-xs">
          <SearchInput
            placeholder="Search degree, university, serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            Status:
          </span>
          {[
            { id: 'ALL', label: `All (${credentials.length})` },
            { id: 'ACTIVE', label: `Active (${credentials.filter((c) => c.status === 'ACTIVE').length})` },
            { id: 'REVOKED', label: `Revoked (${credentials.filter((c) => c.status === 'REVOKED').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                statusFilter === tab.id
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Credentials */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={search || statusFilter !== 'ALL' ? 'No matching credentials' : 'No credentials in your wallet'}
          description={
            search || statusFilter !== 'ALL'
              ? 'Try modifying your search keywords or filter selection.'
              : 'Credentials issued to your Fayda identity by Ethiopian universities will appear here.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cred) => (
            <div
              key={cred.id}
              onClick={() => navigate(`/credentials/${cred.id}`)}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-navy-400 hover:shadow-lg cursor-pointer"
            >
              {/* Top security banner strip */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Building2 className="h-4 w-4 text-navy-700" />
                  <span className="truncate max-w-[180px]">{cred.institution_name}</span>
                </div>
                {statusBadge(cred.status)}
              </div>

              {/* Main Diploma Header */}
              <div className="py-4 space-y-2">
                <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-navy-800 transition-colors">
                  {cred.degree_name}
                </h3>
                {cred.major && (
                  <p className="text-sm text-slate-600 font-medium">
                    Major in {cred.major}
                  </p>
                )}
              </div>

              {/* Credential Details */}
              <div className="rounded-xl bg-slate-50 p-3.5 space-y-2 text-xs text-slate-600 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Graduation Year:</span>
                  <span className="font-semibold text-slate-800">{cred.graduation_year}</span>
                </div>
                {cred.gpa && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cumulative GPA:</span>
                    <span className="font-semibold text-slate-800">{cred.gpa}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Issue Date:</span>
                  <span className="text-slate-700">{formatDate(cred.issue_date)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200/60 font-mono">
                  <span className="text-slate-400">Serial:</span>
                  <span className="text-navy-900 font-semibold">{cred.serial_number}</span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-navy-800 group-hover:text-navy-900">
                <span className="inline-flex items-center gap-1.5 text-navy-700">
                  <FileCheck2 className="h-4 w-4 text-emerald-600" />
                  View Cryptographic Card
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-navy-900 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
