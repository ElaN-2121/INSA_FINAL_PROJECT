import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock,
  Users,
  Award,
  ShieldCheck,
  FileSearch,
  ShieldAlert,
  ChevronRight,
  Plus,
  Lock,
  AlertCircle
} from 'lucide-react';
import { Loader, StatCard, Button, PageHeader, Badge } from '@ethiocred/ui';
import { get } from '../../services/api.js';

export default function Dashboard() {
  const [institutions, setInstitutions] = useState([]);
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      get('/admin/institutions'),
      get('/admin/institutions/pending'),
      get('/admin/stats'),
    ])
      .then(([instRes, pendingRes, statsRes]) => {
        setInstitutions(instRes.data.data || []);
        setPending(pendingRes.data.data || []);
        setStats(statsRes.data.data || null);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const total = institutions.length;
    const active = institutions.filter((i) => i.status === 'ACTIVE').length;
    const pendingCount = institutions.filter((i) =>
      ['PENDING', 'UNDER_REVIEW'].includes(i.status)
    ).length;
    return { total, active, pending: pendingCount };
  }, [institutions]);

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
        title="National Trust Registry Administration"
        description="Root security administration: institutional accreditation, cryptographic key governance, and system-wide audit telemetry."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/audit-logs')}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <FileSearch className="mr-2 h-4 w-4 text-slate-500" />
              Security Logs
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/institutions')}
              className="bg-navy-900 hover:bg-navy-800 text-white shadow-sm"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Manage Institutions
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

      {/* Pending Accreditation Urgent Banner */}
      {pending.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100/60 p-5 shadow-sm transition hover:shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="rounded-xl bg-amber-500/20 p-2.5 text-amber-900 shrink-0">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-amber-950 text-base">
                  {pending.length} University Accreditation Request{pending.length !== 1 ? 's' : ''} Awaiting Review
                </h3>
                <p className="mt-0.5 text-xs text-amber-800/90 leading-relaxed">
                  Higher education institutions pending approval cannot issue cryptographically binding credentials until vetted.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/institutions')}
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
            >
              Review Pending
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Institutions"
          value={counts.total}
          icon={Building2}
          helpText="Accredited & pending"
        />
        <StatCard
          label="Active Trust Members"
          value={counts.active}
          icon={CheckCircle2}
          helpText="Authorized to sign credentials"
        />
        <StatCard
          label="Pending Review"
          value={counts.pending}
          icon={Clock}
          helpText={
            counts.pending > 0
              ? `${counts.pending} awaiting clearance`
              : 'Zero backlog'
          }
          trend={counts.pending > 0 ? { value: `${counts.pending} pending`, positive: false } : { value: 'Zero backlog', positive: true }}
        />
      </div>

      {/* Platform Activity Stats Row */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total Registered Users"
            value={stats.users}
            icon={Users}
            helpText="Students, registrars & employers"
          />
          <StatCard
            label="Total Sealed Credentials"
            value={stats.credentials}
            icon={Award}
            helpText="RSA-signed diplomas stored"
          />
          <StatCard
            label="Verification Inquiries"
            value={stats.verifications}
            icon={ShieldCheck}
            helpText="Cryptographic checks completed"
          />
        </div>
      )}

      {/* Quick Launchpad Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => navigate('/institutions')}
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-navy-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-navy-50 p-3 text-navy-800 group-hover:bg-navy-100 transition-colors">
              <Building2 className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 group-hover:text-navy-900 transition-all" />
          </div>
          <h3 className="mt-4 font-display font-bold text-slate-900 text-base">
            Trust Registry Governance
          </h3>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Onboard new universities, review registration numbers, manage public key rotations, and suspend rogue issuers.
          </p>
        </div>

        <div
          onClick={() => navigate('/audit-logs')}
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-navy-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-700 group-hover:bg-slate-200 transition-colors">
              <FileSearch className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 group-hover:text-navy-900 transition-all" />
          </div>
          <h3 className="mt-4 font-display font-bold text-slate-900 text-base">
            System Security Audit Logs
          </h3>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Monitor real-time security events, authentication attempts, revocation notices, and IP address telemetry.
          </p>
        </div>

        <div
          onClick={() => navigate('/security-demo')}
          className="group rounded-2xl border border-navy-800 bg-gradient-to-br from-navy-950 to-slate-900 p-6 text-white shadow-md transition-all hover:shadow-lg cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="mt-4 font-display font-bold text-white text-base">
            Interactive Attack Simulator
          </h3>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            Simulate GPA tampering, unauthorized rogue university keys, and revoked credential verification defense.
          </p>
        </div>
      </div>
    </div>
  );
}
