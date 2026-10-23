import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  Clock,
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  ArrowRight,
  Fingerprint,
  QrCode,
  Bell,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { get, formatDate } from '@ethiocred/utils';
import { Badge, Loader, StatCard, Button, EmptyState } from '@ethiocred/ui';
import { useAuth } from '../../context/AuthContext.jsx';

function statusBadge(status) {
  if (status === 'ACTIVE') return <Badge variant="green">ACTIVE</Badge>;
  if (status === 'REVOKED') return <Badge variant="red">REVOKED</Badge>;
  return <Badge variant="gray">{status}</Badge>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [credentials, setCredentials] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      get('/auth/me'),
      get('/credentials/mine'),
      get('/verification/requests/pending'),
    ])
      .then(([meRes, credRes, pendingRes]) => {
        setProfile(meRes.data.data);
        setCredentials(credRes.data.data || []);
        setPendingRequests(pendingRes.data.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const activeCredentials = useMemo(
    () => credentials.filter((c) => c.status === 'ACTIVE'),
    [credentials]
  );

  const recentCredentials = useMemo(
    () =>
      [...credentials]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3),
    [credentials]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  const displayName = profile?.full_name || user?.full_name || 'Student';
  const faydaId = profile?.fayda_id || user?.fayda_id || '—';

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Sovereign Wallet Identity Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 p-7 text-white shadow-lg border border-navy-700/50">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <GraduationCap className="h-64 w-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-navy-700/80 px-3 py-1 text-xs font-medium text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Sovereign Academic Wallet · Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white">
              Welcome back, {displayName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs bg-navy-950/60 px-3 py-1 rounded-md border border-navy-700">
                <Fingerprint className="h-3.5 w-3.5 text-amber-400" />
                Fayda ID: <span className="text-white font-semibold">{faydaId}</span>
              </span>
              <span className="text-slate-400">·</span>
              <span>{profile?.email || user?.email}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md border-0"
              onClick={() => navigate('/credentials')}
            >
              <Award className="h-4 w-4 mr-2" />
              View Credentials
            </Button>
            <Button
              variant="outline"
              size="md"
              className="border-slate-600 text-white hover:bg-white/10"
              onClick={() => navigate('/requests')}
            >
              <Clock className="h-4 w-4 mr-2" />
              Consent Center
              {pendingRequests.length > 0 && (
                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-navy-950">
                  {pendingRequests.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Total Credentials"
          value={credentials.length}
          icon={Award}
          helpText="Cryptographically sealed"
        />
        <StatCard
          label="Active & Verifiable"
          value={activeCredentials.length}
          icon={CheckCircle2}
          helpText="Accredited in Trust Registry"
        />
        <StatCard
          label="Pending Consent Requests"
          value={pendingRequests.length}
          icon={Clock}
          helpText={
            pendingRequests.length > 0
              ? `${pendingRequests.length} awaiting your approval`
              : 'All requests reviewed'
          }
        />
      </div>

      {/* Pending Consent Action Banner */}
      {pendingRequests.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm transition hover:shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-100 p-2.5 text-amber-700 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-950 text-base">
                  {pendingRequests.length} Employer Consent Request{pendingRequests.length > 1 ? 's' : ''} Awaiting Your Decision
                </h3>
                <p className="text-sm text-amber-800/90 mt-0.5">
                  Employers cannot verify or access your academic records until you explicitly authorize them.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 self-start sm:self-auto"
              onClick={() => navigate('/requests')}
            >
              Review Requests
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Recent Credentials Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-semibold text-slate-900">
              Recent Digital Credentials
            </h2>
            <p className="text-sm text-slate-500">
              Credentials anchored to your national Fayda identity
            </p>
          </div>
          <Link
            to="/credentials"
            className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-navy-900 transition-colors"
          >
            Browse all ({credentials.length})
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {recentCredentials.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No credentials found in your wallet"
            description="When your university issues your degree or diploma, it will appear here automatically anchored to your Fayda ID."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentCredentials.map((cred) => (
              <div
                key={cred.id}
                onClick={() => navigate(`/credentials/${cred.id}`)}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-navy-300 hover:shadow-md cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-lg bg-navy-50 p-2.5 text-navy-800 transition group-hover:bg-navy-100">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    {statusBadge(cred.status)}
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-slate-900 group-hover:text-navy-800 transition-colors line-clamp-1">
                      {cred.degree_name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-0.5 line-clamp-1">
                      {cred.institution_name}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-1 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Graduation:</span>
                      <span className="font-medium text-slate-700">{cred.graduation_year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Serial:</span>
                      <span className="font-mono text-slate-700">{cred.serial_number}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-navy-700 group-hover:text-navy-900">
                  <span>View Official Certificate</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
