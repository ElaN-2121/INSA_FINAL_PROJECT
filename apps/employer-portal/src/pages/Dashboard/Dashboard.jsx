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
  AlertCircle,
  Users,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { get, formatDateTime } from '@ethiocred/utils';
import {
  Badge,
  Loader,
  Table,
  StatCard,
  Button,
  EmptyState,
  PageHeader,
  BarList,
  TrendChart,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Skeleton
} from '@ethiocred/ui';
import { getVerificationResults } from '../../utils/verificationCache.js';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pipelineData, setPipelineData] = useState(null);
  const [pipelineLoading, setPipelineLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    get('/verification/history')
      .then(({ data }) => setHistory(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load history'))
      .finally(() => setLoading(false));

    get('/analytics/employer/candidates')
      .then((res) => setPipelineData(res.data.data))
      .catch((err) => console.error('Failed to load candidate analytics on dashboard', err))
      .finally(() => setPipelineLoading(false));
  }, []);

  const results = getVerificationResults();

  const stats = useMemo(() => ({
    total: results.length,
    verified: results.filter((r) => r.valid).length,
    failed: results.filter((r) => !r.valid).length,
    requests: history.length,
  }), [results, history]);

  const recentResults = results.slice(0, 8);

  const pipelineTotals = pipelineData?.pipeline_totals || {};
  const pipelineUniversities = pipelineData?.universities || [];
  const pipelineTrend = pipelineData?.monthly_trend || [];

  const universityBarList = useMemo(() => {
    return pipelineUniversities.slice(0, 5).map((u) => ({
      label: u.institution_name,
      value: u.approved_candidates,
      valueDisplay: `${u.approved_candidates} approved`,
      sublabel: `${u.total_requests} requests (${u.share_percentage}% share)`,
      color: 'bg-navy-700',
    }));
  }, [pipelineUniversities]);

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
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Verifications Run"
            value={stats.total}
            icon={FileSearch}
            helpText="Cryptographic checks run"
          />
          <StatCard
            label="Verified"
            value={stats.verified}
            icon={CheckCircle2}
            helpText="100% signature integrity"
          />
          <StatCard
            label="Failed"
            value={stats.failed}
            icon={XCircle}
            helpText="Tampering / revocation flagged"
            trend={{ value: 'Tampering / revocation flagged', positive: false }}
          />
          <StatCard
            label="Consent Requests"
            value={stats.requests}
            icon={UserCheck}
            helpText="Candidate consent records"
          />
        </div>
        <p className="text-right text-xs text-slate-500 font-medium pr-1">
          Counts reflect this browser session.
        </p>
      </div>

      {/* Talent Pipeline Section */}
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-navy-950">
                Talent Pipeline
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Candidate Insights
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Candidate consent throughput, institutional sourcing channels, and monthly applicant volumes
            </p>
          </div>
          <Link
            to="/pipeline"
            className="inline-flex items-center gap-1 text-xs font-bold text-navy-800 hover:text-navy-950 transition-colors shrink-0"
          >
            Explore Full Pipeline Hub
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Pipeline Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Approved Candidates
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-navy-950 font-display">
                {pipelineLoading ? '...' : (pipelineTotals.approved_candidates ?? 0)}
              </span>
              <span className="text-xs text-emerald-700 font-semibold">
                ready to verify
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Pending Consent
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-700 font-display">
                {pipelineLoading ? '...' : (pipelineTotals.pending_requests ?? 0)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                in student wallet
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Approval Rate
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-800 font-display">
                {pipelineLoading ? '...' : `${pipelineTotals.approval_rate ?? 0}%`}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                across requests
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Avg Time to Approval
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 font-display">
                {pipelineLoading ? '...' : (pipelineTotals.avg_time_to_approval_display || 'N/A')}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                response latency
              </span>
            </div>
          </div>
        </div>

        {/* Visualizations: University Sourcing + Monthly Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 pt-2">
          {/* Sourcing Breakdown */}
          <div className="lg:col-span-2 space-y-2 border border-slate-100 rounded-xl p-4 bg-slate-50/30">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <Building2 size={14} className="text-navy-700" />
              <span>University Sourcing Channels</span>
            </h4>
            <BarList
              data={universityBarList}
              isLoading={pipelineLoading}
              emptyTitle="No sourcing records"
              emptyMessage="No candidate requests sent across universities."
              barColor="bg-navy-800"
            />
          </div>

          {/* Monthly Trend Preview */}
          <div className="lg:col-span-3 space-y-2 border border-slate-100 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-navy-700" />
              <span>Candidate Consent Trend (Last 6 Months)</span>
            </h4>
            <TrendChart
              data={pipelineTrend.map((m) => ({
                label: m.period_label,
                value: m.requests_sent,
                secondaryValue: m.approved,
              }))}
              height={190}
              primaryColor="#16345E"
              secondaryColor="#16A34A"
              primaryLabel="Requests Sent"
              secondaryLabel="Approved"
              showSecondary={true}
              isLoading={pipelineLoading}
              emptyTitle="No trend recorded"
              emptyMessage="No candidate pipeline activity in the last 6 months."
            />
          </div>
        </div>
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
