import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileSearch,
  History as HistoryIcon,
  UserCheck,
  ChevronRight,
  AlertTriangle,
  Send,
  Building2,
  AlertCircle
} from 'lucide-react';
import { get, formatDateTime } from '@ethiocred/utils';
import { Badge, Loader, Table, StatCard, Button, EmptyState, PageHeader } from '@ethiocred/ui';
import { getVerificationResults } from '../../utils/verificationCache.js';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    get('/verification/history')
      .then(({ data }) => setHistory(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  const results = getVerificationResults();

  const stats = useMemo(() => ({
    total: results.length,
    verified: results.filter((r) => r.valid).length,
    failed: results.filter((r) => !r.valid).length,
    requests: history.length,
  }), [results, history]);

  const recentResults = results.slice(0, 8);

  const columns = [
    {
      key: 'serial_number',
      label: 'Credential Serial',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-navy-900">
          {row.serial_number}
        </span>
      ),
    },
    {
      key: 'holder_name',
      label: 'Candidate Name',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.holder_name}</p>
          <p className="text-xs text-slate-500">{row.institution_name}</p>
        </div>
      ),
    },
    {
      key: 'verifiedAt',
      label: 'Verification Timestamp',
      render: (row) => (
        <span className="text-xs text-slate-600">{formatDateTime(row.verifiedAt)}</span>
      ),
    },
    {
      key: 'valid',
      label: 'Cryptographic Verdict',
      render: (row) =>
        row.valid ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            VERIFIED VALID
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800 border border-rose-200">
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
            FAILED / INVALID
          </span>
        ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Verification Operations Center"
        description="Verify candidate credentials against accredited Ethiopian university trust registries in real time."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/request')}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Send className="mr-2 h-4 w-4 text-slate-500" />
              Request Consent
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/verify')}
              className="bg-navy-900 hover:bg-navy-800 text-white shadow-sm"
            >
              <FileSearch className="mr-2 h-4 w-4" />
              Verify Credential
            </Button>
          </div>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Verifications Run"
          value={stats.total}
          icon={FileSearch}
          trend={{ value: 'Real-time cryptographic checks', positive: true }}
        />
        <StatCard
          title="Authentic / Verified"
          value={stats.verified}
          icon={CheckCircle2}
          trend={{ value: '100% signature integrity', positive: true }}
        />
        <StatCard
          title="Failed / Tampered"
          value={stats.failed}
          icon={XCircle}
          trend={{ value: 'Tampering / revocation flagged', positive: false }}
        />
        <StatCard
          title="Student Consent Requests"
          value={stats.requests}
          icon={UserCheck}
          trend={{ value: 'Consent-based checks', positive: true }}
        />
      </div>

      {/* Quick Launchpad Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => navigate('/verify')}
          className="group rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50 to-teal-100/40 p-5 shadow-sm transition-all hover:shadow-md hover:border-teal-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-teal-600/10 p-3 text-teal-800 group-hover:bg-teal-600/20 transition-colors">
              <FileSearch className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-teal-700/60 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="mt-4 font-display font-bold text-slate-900 text-base">
            Verify Approved Credential
          </h3>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Execute the 7-step cryptographic chain validation and generate an official printable verification dossier.
          </p>
        </div>

        <div
          onClick={() => navigate('/request')}
          className="group rounded-2xl border border-navy-200/80 bg-gradient-to-br from-navy-50 to-slate-100/40 p-5 shadow-sm transition-all hover:shadow-md hover:border-navy-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-navy-800/10 p-3 text-navy-900 group-hover:bg-navy-800/20 transition-colors">
              <Send className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-navy-700/60 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="mt-4 font-display font-bold text-slate-900 text-base">
            Request Candidate Consent
          </h3>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Submit a formal consent request to the candidate's sovereign wallet using their credential ID or serial.
          </p>
        </div>

        <div
          onClick={() => navigate('/history')}
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-700 group-hover:bg-slate-200 transition-colors">
              <HistoryIcon className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="mt-4 font-display font-bold text-slate-900 text-base">
            Verification Audit History
          </h3>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Inspect past verification results and download certified compliance audit logs for hiring records.
          </p>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              Recent Verification Activity
            </h3>
            <p className="text-sm text-slate-500">
              Instant cryptographic proof results generated in this browser session
            </p>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center gap-1 text-sm font-semibold text-navy-800 hover:text-navy-950 transition-colors"
          >
            Full history
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {recentResults.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="No verifications executed yet"
            description="Once you verify approved candidate credentials, the verification dossiers and timeline logs will appear here."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/verify')}
                className="bg-navy-900 hover:bg-navy-800 text-white"
              >
                Go to Verification Center
              </Button>
            }
          />
        ) : (
          <Table
            columns={columns}
            data={recentResults}
            onRowClick={() => navigate('/history')}
          />
        )}
      </div>
    </div>
  );
}
