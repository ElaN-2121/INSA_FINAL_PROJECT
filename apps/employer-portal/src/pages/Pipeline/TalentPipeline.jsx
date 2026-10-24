import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Building2,
  GraduationCap,
  Search,
  ShieldCheck,
  ChevronRight,
  ArrowUpDown,
  Filter,
  ExternalLink,
  Layers
} from 'lucide-react';
import { get, formatDate, formatDateTime } from '@ethiocred/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  BarList,
  TrendChart,
  Donut,
  SearchInput,
  Badge,
  Button,
  EmptyState,
  Skeleton,
  PageHeader,
} from '@ethiocred/ui';

export default function TalentPipeline() {
  const [pipelineData, setPipelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Table Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'APPROVED' | 'PENDING' | 'DENIED'
  const [universityFilter, setUniversityFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [sortField, setSortField] = useState('requested_at');
  const [sortDirection, setSortDirection] = useState('desc');

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    get('/analytics/employer/candidates')
      .then((res) => {
        setPipelineData(res.data.data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load talent pipeline analytics');
      })
      .finally(() => setLoading(false));
  }, []);

  const totals = pipelineData?.pipeline_totals || {};
  const universities = pipelineData?.universities || [];
  const departments = pipelineData?.departments || [];
  const monthlyTrend = pipelineData?.monthly_trend || [];
  const candidates = pipelineData?.candidates || [];

  // University BarList data
  const universityBarList = useMemo(() => {
    return universities.map((u) => ({
      label: u.institution_name,
      value: u.approved_candidates,
      valueDisplay: `${u.approved_candidates} approved`,
      sublabel: `${u.total_requests} requests (${u.share_percentage}% share)`,
      color: 'bg-navy-700',
    }));
  }, [universities]);

  // Department Donut data
  const departmentDonutData = useMemo(() => {
    const colors = [
      '#16345E', // navy-800
      '#255594', // navy-600
      '#16A34A', // ethio-green
      '#D97706', // ethio-gold
      '#3B6FAF', // navy-500
      '#64748B', // slate-500
      '#0F274A', // navy-900
    ];
    return departments.slice(0, 6).map((d, i) => ({
      label: d.department,
      value: d.approved_candidates,
      color: colors[i % colors.length],
    }));
  }, [departments]);

  // Filtered and sorted candidate rows
  const filteredCandidates = useMemo(() => {
    let result = [...candidates];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.candidate_name?.toLowerCase().includes(q) ||
          c.candidate_email?.toLowerCase().includes(q) ||
          c.candidate_fayda_id?.toLowerCase().includes(q) ||
          c.serial_number?.toLowerCase().includes(q) ||
          c.department?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (universityFilter !== 'ALL') {
      result = result.filter((c) => c.institution_name === universityFilter);
    }

    if (departmentFilter !== 'ALL') {
      result = result.filter((c) => c.department === departmentFilter);
    }

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'requested_at' || sortField === 'responded_at') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [candidates, searchQuery, statusFilter, universityFilter, departmentFilter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <PageHeader
        title="Talent Pipeline & Candidate Analytics"
        subtitle="Track candidate consent requests, monitor university sourcing distribution, and verify academic records."
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/request')}
            className="bg-navy-900 hover:bg-navy-800 text-white shadow-sm"
          >
            <Search className="mr-2 h-4 w-4" />
            Request New Candidate Consent
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Candidates Approved"
          value={loading ? '...' : (totals.approved_candidates ?? 0)}
          icon={CheckCircle2}
          helpText="Ready for cryptographic verification"
        />
        <StatCard
          label="Pending Consent"
          value={loading ? '...' : (totals.pending_requests ?? 0)}
          icon={Clock}
          helpText="Awaiting student sovereign authorization"
        />
        <StatCard
          label="Declined Requests"
          value={loading ? '...' : (totals.denied_requests ?? 0)}
          icon={XCircle}
          helpText="Access withheld by candidate"
        />
        <StatCard
          label="Approval Rate"
          value={loading ? '...' : `${totals.approval_rate ?? 0}%`}
          icon={TrendingUp}
          helpText={`Avg response: ${totals.avg_time_to_approval_display || 'N/A'}`}
        />
      </div>

      {/* Visual Analytics Grid: Sourcing & Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* University Sourcing Breakdown */}
        <Card className="shadow-soft">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base text-navy-950 flex items-center gap-2">
              <Building2 size={18} className="text-navy-700" />
              <span>Sourcing by University</span>
            </CardTitle>
            <CardDescription>Approved candidates by accredited institution</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <BarList
              data={universityBarList}
              isLoading={loading}
              error={error}
              emptyTitle="No universities yet"
              emptyMessage="No candidate requests sent across universities."
              barColor="bg-navy-800"
            />
          </CardContent>
        </Card>

        {/* Academic Program Distribution (Donut) */}
        <Card className="shadow-soft">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base text-navy-950 flex items-center gap-2">
              <GraduationCap size={18} className="text-navy-700" />
              <span>Program & Major Distribution</span>
            </CardTitle>
            <CardDescription>Approved candidate volume by discipline</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Donut
              data={departmentDonutData}
              centerLabel="Candidates"
              centerValue={totals.approved_candidates}
              isLoading={loading}
              emptyTitle="No program data"
              emptyMessage="No approved academic credentials found."
            />
          </CardContent>
        </Card>

        {/* Monthly Applicant Trend */}
        <Card className="shadow-soft">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base text-navy-950 flex items-center gap-2">
              <TrendingUp size={18} className="text-navy-700" />
              <span>Applicant Pipeline Trend</span>
            </CardTitle>
            <CardDescription>Monthly consent requests and approvals (6 months)</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <TrendChart
              data={monthlyTrend.map((m) => ({
                label: m.period_label,
                value: m.requests_sent,
                secondaryValue: m.approved,
              }))}
              height={200}
              primaryColor="#16345E"
              secondaryColor="#16A34A"
              primaryLabel="Requests Sent"
              secondaryLabel="Approved"
              showSecondary={true}
              isLoading={loading}
              emptyTitle="No trend data"
              emptyMessage="No applicant requests recorded in the last 6 months."
            />
          </CardContent>
        </Card>
      </div>

      {/* Candidates Interactive Table */}
      <Card className="shadow-soft">
        <CardHeader className="border-b border-slate-100 pb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg text-navy-950 flex items-center gap-2">
                <Users size={20} className="text-navy-700" />
                <span>Candidate Pipeline Directory</span>
              </CardTitle>
              <CardDescription>
                Detailed list of all candidate verification consent requests, response statuses, and direct verification actions
              </CardDescription>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-72">
              <SearchInput
                placeholder="Search candidate name, Fayda ID, serial..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Filter Bar Chips */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Status Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] mr-1">
                Status:
              </span>
              {[
                { id: 'ALL', label: 'All Candidates' },
                { id: 'APPROVED', label: 'Approved' },
                { id: 'PENDING', label: 'Pending' },
                { id: 'DENIED', label: 'Declined' },
              ].map((chip) => {
                const isActive = statusFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setStatusFilter(chip.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all focus-ring ${
                      isActive
                        ? 'bg-navy-900 text-white shadow-soft'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    aria-pressed={isActive}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* University & Department Selectors */}
            <div className="flex items-center gap-3">
              <select
                value={universityFilter}
                onChange={(e) => setUniversityFilter(e.target.value)}
                className="text-xs font-medium rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 focus-ring shadow-soft"
                aria-label="Filter by university"
              >
                <option value="ALL">All Universities</option>
                {universities.map((u) => (
                  <option key={u.institution_name} value={u.institution_name}>
                    {u.institution_name}
                  </option>
                ))}
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="text-xs font-medium rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 focus-ring shadow-soft"
                aria-label="Filter by department"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.department} value={d.department}>
                    {d.department}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" rounded="rounded-lg" />
              ))}
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="p-10 text-center">
              <EmptyState
                icon={Users}
                title="No candidates match your criteria"
                description={
                  searchQuery || statusFilter !== 'ALL' || universityFilter !== 'ALL'
                    ? 'Try adjusting your search terms or clearing the active filters.'
                    : 'No candidate verification requests have been recorded yet.'
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                      onClick={() => handleSort('candidate_name')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Candidate</span>
                        <ArrowUpDown size={12} className="text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                      onClick={() => handleSort('institution_name')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>University</span>
                        <ArrowUpDown size={12} className="text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4">
                      <span>Degree & Program</span>
                    </th>
                    <th
                      className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Status</span>
                        <ArrowUpDown size={12} className="text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                      onClick={() => handleSort('requested_at')}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Requested</span>
                        <ArrowUpDown size={12} className="text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center">
                      <span>Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredCandidates.map((cand) => {
                    const isApproved = cand.status === 'APPROVED' || cand.status === 'COMPLETED';
                    const isPending = cand.status === 'PENDING';
                    const isDenied = cand.status === 'DENIED';

                    return (
                      <tr key={cand.request_id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Candidate */}
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 text-sm">{cand.candidate_name}</p>
                          <p className="text-slate-400 font-mono text-[11px]">
                            {cand.candidate_fayda_id || cand.candidate_email}
                          </p>
                        </td>

                        {/* University */}
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800">{cand.institution_name}</p>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {cand.serial_number}
                          </span>
                        </td>

                        {/* Degree & Department */}
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{cand.department}</p>
                          <p className="text-slate-500 text-[11px]">{cand.degree_name}</p>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                              Approved
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
                              <Clock size={12} className="text-amber-600 shrink-0" />
                              Pending
                            </span>
                          )}
                          {isDenied && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-800 border border-rose-200">
                              <XCircle size={12} className="text-rose-600 shrink-0" />
                              Declined
                            </span>
                          )}
                        </td>

                        {/* Requested / Responded */}
                        <td className="py-3 px-4 text-center font-mono text-slate-600 text-[11px]">
                          <div>{formatDate(cand.requested_at)}</div>
                          {cand.responded_at ? (
                            <div className="text-[10px] text-slate-400">
                              Responded: {formatDate(cand.responded_at)}
                            </div>
                          ) : (
                            <div className="text-[10px] text-amber-600">Awaiting consent</div>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-center">
                          {isApproved ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/verify?id=${cand.credential_id}`)}
                              className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-400 font-semibold"
                            >
                              <ShieldCheck size={14} className="mr-1 text-emerald-600" />
                              Verify Credential
                            </Button>
                          ) : (
                            <span className="text-slate-400 text-xs italic font-sans">
                              Consent required
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
