import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Award,
  Search,
  Building2,
  Lock,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Eye,
  FileCheck2,
  Filter,
  GraduationCap
} from 'lucide-react';
import { get, formatDateTime, formatDate } from '@ethiocred/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  Badge,
  Button,
  EmptyState,
  Skeleton,
  SearchInput,
  PageHeader,
  StackedBar,
  BarList
} from '@ethiocred/ui';

export default function ActivityCenter() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL'); // 'ALL' | 'CONSENT_REQUEST' | 'VERIFICATION_CHECK'
  const [outcomeFilter, setOutcomeFilter] = useState('ALL'); // 'ALL' | 'POSITIVE' | 'PENDING' | 'NEGATIVE'

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    get('/analytics/student/activity')
      .then((res) => {
        setData(res.data.data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load sovereign activity audit log');
      })
      .finally(() => setLoading(false));
  }, []);

  const requestsSummary = data?.requests_summary || {
    received: 0,
    approved: 0,
    denied: 0,
    pending: 0,
    approval_rate: 0,
  };

  const verificationsSummary = data?.verifications_summary || {
    total_verifications: 0,
    valid_verifications: 0,
    invalid_verifications: 0,
    last_verified: null,
  };

  const accessLog = data?.access_log || [];
  const credentialHealth = data?.credential_health || [];

  // StackedBar segments for Consent Requests
  const consentSegments = useMemo(() => [
    {
      label: 'Approved',
      value: requestsSummary.approved,
      color: '#16A34A', // ethio-green
    },
    {
      label: 'Pending',
      value: requestsSummary.pending,
      color: '#D97706', // ethio-gold
    },
    {
      label: 'Denied',
      value: requestsSummary.denied,
      color: '#DC2626', // rose-600
    },
  ], [requestsSummary]);

  // BarList data for Credential Verifications
  const credsBarList = useMemo(() => {
    return credentialHealth.map((cred) => ({
      label: `${cred.degree_name} (${cred.major || 'General'})`,
      value: cred.times_verified,
      valueDisplay: `${cred.times_verified} checks`,
      sublabel: `${cred.institution_name} · ${cred.serial_number}`,
      color: cred.status === 'ACTIVE' ? 'bg-navy-700' : 'bg-rose-600',
    }));
  }, [credentialHealth]);

  // Filtered access log entries
  const filteredLogs = useMemo(() => {
    let result = [...accessLog];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.employer_company?.toLowerCase().includes(q) ||
          item.employer_name?.toLowerCase().includes(q) ||
          item.degree_name?.toLowerCase().includes(q) ||
          item.serial_number?.toLowerCase().includes(q) ||
          item.action_description?.toLowerCase().includes(q)
      );
    }

    // Event Type filter
    if (eventTypeFilter !== 'ALL') {
      result = result.filter((item) => item.event_type === eventTypeFilter);
    }

    // Outcome filter
    if (outcomeFilter === 'POSITIVE') {
      result = result.filter((item) => ['APPROVED', 'VALID', 'COMPLETED'].includes(item.status));
    } else if (outcomeFilter === 'PENDING') {
      result = result.filter((item) => item.status === 'PENDING');
    } else if (outcomeFilter === 'NEGATIVE') {
      result = result.filter((item) => ['DENIED', 'INVALID', 'REVOKED'].includes(item.status));
    }

    return result;
  }, [accessLog, searchQuery, eventTypeFilter, outcomeFilter]);

  const activeCredentialsCount = credentialHealth.filter((c) => c.is_active).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Privacy & Activity Center"
        subtitle="Sovereign audit trail of all employer consent requests, authorization decisions, and cryptographic verification checks run on your credentials."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/credentials')}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Award className="mr-2 h-4 w-4 text-navy-700" />
              My Credentials ({credentialHealth.length})
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/requests')}
              className="bg-navy-900 hover:bg-navy-800 text-white shadow-sm"
            >
              <Clock className="mr-2 h-4 w-4 text-emerald-400" />
              Review Pending Requests
              {requestsSummary.pending > 0 && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-navy-950">
                  {requestsSummary.pending}
                </span>
              )}
            </Button>
          </div>
        }
      />

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* High-Level Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Consent Requests Received"
          value={loading ? '...' : requestsSummary.received}
          icon={ShieldCheck}
          helpText={`${requestsSummary.approved} approved · ${requestsSummary.pending} pending decision`}
        />
        <StatCard
          label="Consent Approval Rate"
          value={loading ? '...' : `${requestsSummary.approval_rate}%`}
          icon={CheckCircle2}
          helpText={`${requestsSummary.denied} requests declined by you`}
        />
        <StatCard
          label="Cryptographic Verifications"
          value={loading ? '...' : verificationsSummary.total_verifications}
          icon={FileCheck2}
          helpText={`${verificationsSummary.valid_verifications} valid cryptographic checks`}
        />
        <StatCard
          label="Credential Health"
          value={loading ? '...' : `${activeCredentialsCount} / ${credentialHealth.length} Active`}
          icon={Lock}
          helpText="Anchored to National Fayda Identity"
        />
      </div>

      {/* Analytics Visual Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consent Decisions Breakdown */}
        <Card className="shadow-soft">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-navy-950 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <span>Sovereign Consent Decisions</span>
                </CardTitle>
                <CardDescription>
                  Your selective disclosure choices for third-party access
                </CardDescription>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Student Controlled
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <StackedBar
              segments={consentSegments}
              total={requestsSummary.received}
              isLoading={loading}
              height={14}
              emptyMessage="No consent requests received yet."
              ariaLabel="Consent Decisions Breakdown"
            />
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Lock size={14} className="text-navy-700" />
                Zero-Knowledge Privacy Safeguard
              </p>
              <p>
                Employers and verifying agencies cannot view your degree credentials without your explicit cryptographic authorization. When you approve a request, only the targeted credential is shared.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Credential Verification Distribution */}
        <Card className="shadow-soft">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-navy-950 flex items-center gap-2">
                  <Activity size={18} className="text-navy-700" />
                  <span>Verification Checks by Credential</span>
                </CardTitle>
                <CardDescription>
                  How frequently each held credential has been verified
                </CardDescription>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {verificationsSummary.last_verified
                  ? `Last check: ${formatDate(verificationsSummary.last_verified)}`
                  : 'No checks recorded'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <BarList
              data={credsBarList}
              isLoading={loading}
              emptyTitle="No credentials verified yet"
              emptyMessage="Verifications will appear here once employers or registrars validate your credentials."
            />
          </CardContent>
        </Card>
      </div>

      {/* Chronological Access Audit Log Card */}
      <Card className="shadow-soft">
        <CardHeader className="border-b border-slate-100 pb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg text-navy-950 flex items-center gap-2">
                <Clock size={20} className="text-navy-700" />
                <span>Chronological Access & Verification Audit Trail</span>
              </CardTitle>
              <CardDescription>
                Comprehensive timestamped record of every organization that requested access or verified your records
              </CardDescription>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-80">
              <SearchInput
                placeholder="Search employer, degree, or serial..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Filter Bar Chips */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Event Type Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] mr-1">
                Event Type:
              </span>
              {[
                { key: 'ALL', label: `All Events (${accessLog.length})` },
                {
                  key: 'CONSENT_REQUEST',
                  label: `Consent Requests (${accessLog.filter((l) => l.event_type === 'CONSENT_REQUEST').length})`,
                },
                {
                  key: 'VERIFICATION_CHECK',
                  label: `Verifications Run (${accessLog.filter((l) => l.event_type === 'VERIFICATION_CHECK').length})`,
                },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setEventTypeFilter(key)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    eventTypeFilter === key
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Outcome Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] mr-1">
                Outcome:
              </span>
              {[
                { key: 'ALL', label: 'All Outcomes' },
                { key: 'POSITIVE', label: 'Approved / Valid' },
                { key: 'PENDING', label: 'Pending' },
                { key: 'NEGATIVE', label: 'Declined / Revoked' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setOutcomeFilter(key)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    outcomeFilter === key
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" rounded="rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Search}
                title="No activity events found"
                description={
                  searchQuery || eventTypeFilter !== 'ALL' || outcomeFilter !== 'ALL'
                    ? 'No events match your selected filters. Try resetting the search or filter chips.'
                    : 'Your sovereign audit trail is currently empty. Activities will appear as employers request or verify credentials.'
                }
                action={
                  (searchQuery || eventTypeFilter !== 'ALL' || outcomeFilter !== 'ALL') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('');
                        setEventTypeFilter('ALL');
                        setOutcomeFilter('ALL');
                      }}
                      className="mt-2"
                    >
                      Clear Filters
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Date & Event
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Requesting Organization
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Target Credential
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Activity Description
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Audit Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredLogs.map((log) => {
                    const isVerification = log.event_type === 'VERIFICATION_CHECK';
                    const isApprovedOrValid = ['APPROVED', 'VALID', 'COMPLETED'].includes(log.status);
                    const isPending = log.status === 'PENDING';
                    const isDeniedOrRevoked = ['DENIED', 'INVALID', 'REVOKED'].includes(log.status);

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Date & Event */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isVerification ? 'bg-navy-600' : 'bg-emerald-600'
                              }`}
                            />
                            <span className="font-medium text-slate-900 text-xs">
                              {formatDateTime(log.requested_at)}
                            </span>
                          </div>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                isVerification
                                  ? 'bg-navy-50 text-navy-800 border border-navy-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {isVerification ? 'VERIFICATION CHECK' : 'CONSENT REQUEST'}
                            </span>
                          </div>
                        </td>

                        {/* Requesting Organization */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-slate-100 text-slate-700 shrink-0">
                              <Building2 size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">
                                {log.employer_company}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {log.employer_name}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Target Credential */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900 text-xs">
                              {log.degree_name}
                            </p>
                            <p className="font-mono text-[11px] text-slate-500 mt-0.5">
                              {log.serial_number}
                            </p>
                          </div>
                        </td>

                        {/* Activity Description */}
                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-700 font-medium">
                            {log.action_description}
                          </p>
                          {log.responded_at && log.responded_at !== log.requested_at && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Responded {formatDateTime(log.responded_at)}
                            </p>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {isApprovedOrValid && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              {log.status}
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock size={12} className="text-amber-600" />
                              PENDING
                            </span>
                          )}
                          {isDeniedOrRevoked && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                              <XCircle size={12} className="text-rose-600" />
                              {log.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
