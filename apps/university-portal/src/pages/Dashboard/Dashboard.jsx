import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building2,
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { get, formatDate } from '@ethiocred/utils';
import { Badge, Loader, Table, StatCard, Button, EmptyState, PageHeader } from '@ethiocred/ui';

function statusBadge(status) {
  if (status === 'ACTIVE') return <Badge variant="green">ACTIVE</Badge>;
  if (status === 'REVOKED') return <Badge variant="red">REVOKED</Badge>;
  return <Badge variant="gray">{status}</Badge>;
}

export default function Dashboard() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    get('/credentials/institution')
      .then(({ data }) => setCredentials(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load credentials'))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const issuedThisMonth = credentials.filter((c) => {
      const d = new Date(c.created_at);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    return {
      total: credentials.length,
      active: credentials.filter((c) => c.status === 'ACTIVE').length,
      revoked: credentials.filter((c) => c.status === 'REVOKED').length,
      batchesThisMonth: issuedThisMonth,
    };
  }, [credentials]);

  const recentCredentials = useMemo(
    () =>
      [...credentials]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 8),
    [credentials]
  );

  const columns = [
    {
      key: 'serial_number',
      label: 'Serial Number',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-navy-900">
          {row.serial_number}
        </span>
      ),
    },
    {
      key: 'holder_name',
      label: 'Graduate Name',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.holder_name}</p>
          <p className="text-xs text-slate-500 font-mono">{row.holder_fayda_id || 'No Fayda ID'}</p>
        </div>
      ),
    },
    {
      key: 'degree_name',
      label: 'Degree & Program',
      render: (row) => (
        <div>
          <p className="text-slate-800 font-medium">{row.degree_name}</p>
          <p className="text-xs text-slate-500">{row.major || 'Undergraduate'}</p>
        </div>
      ),
    },
    {
      key: 'issue_date',
      label: 'Issuance Date',
      render: (row) => (
        <span className="text-slate-600 text-xs">{formatDate(row.issue_date)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => statusBadge(row.status),
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
      {/* Page Header with Action */}
      <PageHeader
        title="Registrar Issuance Console"
        description="Issue RSA-signed digital degrees, manage staging batches, and maintain accredited institution records."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/credentials')}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <FileText className="mr-2 h-4 w-4 text-slate-500" />
              All Credentials
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/upload')}
              className="bg-navy-900 hover:bg-navy-800 text-white shadow-sm"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Graduation CSV
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Issued"
          value={stats.total}
          icon={Award}
          helpText="Sealed with RSA-2048 key"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={CheckCircle2}
          helpText="Accredited in Trust Registry"
        />
        <StatCard
          label="Revoked"
          value={stats.revoked}
          icon={AlertTriangle}
          helpText="Invalidated in Registry"
          trend={{ value: 'Invalidated in Registry', positive: false }}
        />
        <StatCard
          label="Issued This Month"
          value={stats.batchesThisMonth}
          icon={Calendar}
          helpText="Current academic cycle"
        />
      </div>

      {/* Quick Launchpad Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => navigate('/upload')}
          className="group rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-amber-100/40 p-5 shadow-sm transition-all hover:shadow-md hover:border-amber-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-800 group-hover:bg-amber-500/20 transition-colors">
              <Upload className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-amber-700/60 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="mt-4 font-display font-bold text-slate-900 text-base">
            Upload Graduation Batch
          </h3>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Drag and drop CSV files containing student graduate records for batch validation and cryptographic signing.
          </p>
        </div>

        <div
          onClick={() => navigate('/batches')}
          className="group rounded-2xl border border-navy-200/80 bg-gradient-to-br from-navy-50 to-slate-100/40 p-5 shadow-sm transition-all hover:shadow-md hover:border-navy-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-navy-800/10 p-3 text-navy-900 group-hover:bg-navy-800/20 transition-colors">
              <Layers className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-navy-700/60 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="mt-4 font-display font-bold text-slate-900 text-base">
            Review Staged Batches
          </h3>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Inspect staged records, review error logs, and execute institutional digital signatures.
          </p>
        </div>

        <div
          onClick={() => navigate('/settings')}
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-700 group-hover:bg-slate-200 transition-colors">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="mt-4 font-display font-bold text-slate-900 text-base">
            Institution Key & Registry
          </h3>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Verify active RSA public keys registered with the EthioCred Trust Registry.
          </p>
        </div>
      </div>

      {/* Recent Issuances Table */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              Recent Issued Credentials
            </h3>
            <p className="text-sm text-slate-500">
              Live records committed to the tamper-evident National Credential Registry
            </p>
          </div>
          <Link
            to="/credentials"
            className="inline-flex items-center gap-1 text-sm font-semibold text-navy-800 hover:text-navy-950 transition-colors"
          >
            View all records
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {recentCredentials.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No credentials issued yet"
            description="Upload your university's graduation CSV batch to stage and issue digital diplomas."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/upload')}
                className="bg-navy-900 hover:bg-navy-800 text-white"
              >
                Upload Graduation CSV
              </Button>
            }
          />
        ) : (
          <Table
            columns={columns}
            data={recentCredentials}
            onRowClick={(row) => navigate(`/credentials/${row.id}`)}
          />
        )}
      </div>
    </div>
  );
}
