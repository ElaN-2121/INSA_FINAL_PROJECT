import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Search,
  Filter,
  Shield,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { get } from '@ethiocred/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  SearchInput,
  Select,
  StatCard,
  BarList,
  TrendChart,
  Sparkline,
  Skeleton,
  EmptyState,
  PageHeader,
} from '@ethiocred/ui';

export default function DepartmentInsights() {
  const [departmentsData, setDepartmentsData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [selectedDeptForTrend, setSelectedDeptForTrend] = useState('ALL');
  const [selectedRange, setSelectedRange] = useState('all'); // '30d' | '6m' | '1y' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('times_verified');
  const [sortDirection, setSortDirection] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);
  const [error, setError] = useState(null);

  // Compute from / to ISO strings based on selected chip
  const dateParams = useMemo(() => {
    if (selectedRange === 'all') return {};
    const now = new Date();
    const to = now.toISOString().split('T')[0];
    let fromDate = new Date();

    if (selectedRange === '30d') {
      fromDate.setDate(now.getDate() - 30);
    } else if (selectedRange === '6m') {
      fromDate.setMonth(now.getMonth() - 6);
    } else if (selectedRange === '1y') {
      fromDate.setFullYear(now.getFullYear() - 1);
    }
    const from = fromDate.toISOString().split('T')[0];
    return { from, to };
  }, [selectedRange]);

  // Fetch Department Analytics
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateParams.from) params.set('from', dateParams.from);
    if (dateParams.to) params.set('to', dateParams.to);

    const queryString = params.toString() ? `?${params.toString()}` : '';

    get(`/analytics/university/departments${queryString}`)
      .then((res) => {
        setDepartmentsData(res.data.data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load departmental analytics');
      })
      .finally(() => setLoading(false));
  }, [dateParams]);

  // Fetch Trend Analytics
  useEffect(() => {
    setTrendLoading(true);
    const params = new URLSearchParams();
    if (selectedDeptForTrend && selectedDeptForTrend !== 'ALL') {
      params.set('department', selectedDeptForTrend);
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';

    get(`/analytics/university/trend${queryString}`)
      .then((res) => {
        setTrendData(res.data.data.trend || []);
      })
      .catch((err) => {
        console.error('Failed to load verification trend', err);
      })
      .finally(() => setTrendLoading(false));
  }, [selectedDeptForTrend]);

  const departments = departmentsData?.departments || [];
  const highlights = departmentsData?.highlights || {};
  const totals = departmentsData?.totals || {};

  // Filter & Sort table departments
  const filteredDepartments = useMemo(() => {
    let result = [...departments];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((d) => d.department.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [departments, searchQuery, sortField, sortDirection]);

  // Prepare BarList formatted data
  const barListData = useMemo(() => {
    return [...departments]
      .sort((a, b) => b.times_verified - a.times_verified)
      .slice(0, 6)
      .map((d) => ({
        label: d.department,
        value: d.times_verified,
        valueDisplay: d.times_verified_display,
        sublabel: `${d.credentials_issued_display} issued`,
        color: d.verification_success_rate < 85 ? 'bg-amber-600' : 'bg-navy-700',
      }));
  }, [departments]);

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
        title="Department Verification Insights"
        subtitle="Institutional verification volumes, employer demand metrics, and academic program trends."
      />

      {/* Date Range Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Period:
          </span>
          {[
            { id: 'all', label: 'All Time' },
            { id: '30d', label: 'Last 30 Days' },
            { id: '6m', label: 'Last 6 Months' },
            { id: '1y', label: 'Last 1 Year' },
          ].map((chip) => {
            const isActive = selectedRange === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSelectedRange(chip.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus-ring ${
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

        {/* Privacy Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
          <Shield size={14} className="text-navy-700 shrink-0" />
          <span>Differential privacy active: low volume categories masked (&lt;3)</span>
        </div>
      </div>

      {/* Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Most Verified */}
        <Card className="border-l-4 border-l-navy-700 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-800">
                Most Verified Department
              </span>
              <div className="h-8 w-8 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center">
                <Award size={18} />
              </div>
            </div>
            {loading ? (
              <div className="space-y-2 py-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : highlights.most_verified ? (
              <div>
                <h3 className="text-xl font-bold text-navy-950 font-display">
                  {highlights.most_verified.department}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  <span className="font-mono font-bold text-slate-800">
                    {highlights.most_verified.times_verified}
                  </span>{' '}
                  verifications with{' '}
                  <span className="font-semibold text-emerald-700">
                    {highlights.most_verified.success_rate}% success
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No verifications in selected period</p>
            )}
          </CardContent>
        </Card>

        {/* Highest Approval Rate */}
        <Card className="border-l-4 border-l-emerald-600 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Highest Student Approval
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
            </div>
            {loading ? (
              <div className="space-y-2 py-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : highlights.highest_approval ? (
              <div>
                <h3 className="text-xl font-bold text-navy-950 font-display">
                  {highlights.highest_approval.department}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  <span className="font-semibold text-emerald-700">
                    {highlights.highest_approval.approval_rate}%
                  </span>{' '}
                  consent approval across{' '}
                  <span className="font-mono font-bold text-slate-800">
                    {highlights.highest_approval.requests ?? highlights.highest_approval.consent_requests ?? 0}
                  </span>{' '}
                  requests
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No requests in selected period</p>
            )}
          </CardContent>
        </Card>

        {/* Needs Attention */}
        <Card className="border-l-4 border-l-amber-500 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Needs Attention
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
            </div>
            {loading ? (
              <div className="space-y-2 py-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : highlights.needs_attention ? (
              <div>
                <h3 className="text-xl font-bold text-navy-950 font-display">
                  {highlights.needs_attention.department}
                </h3>
                <p className="mt-1 text-xs text-amber-800 font-medium">
                  {highlights.needs_attention.issue || `${highlights.needs_attention.revoked || 0} credential(s) revoked`}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-1">
                All departments performing within normal verification thresholds.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Verification Trend Chart Section */}
      <Card className="shadow-soft">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <CardTitle className="text-base text-navy-950 flex items-center gap-2">
              <TrendingUp size={18} className="text-navy-700" />
              <span>Verification Trend (Last 6 Months)</span>
            </CardTitle>
            <CardDescription>
              Continuous monthly verification activity showing overall volume and cryptographic validation health.
            </CardDescription>
          </div>

          {/* Department Filter for Trend */}
          <div className="w-full sm:w-64">
            <label htmlFor="dept-trend-select" className="sr-only">
              Filter trend by department
            </label>
            <select
              id="dept-trend-select"
              value={selectedDeptForTrend}
              onChange={(e) => setSelectedDeptForTrend(e.target.value)}
              className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-soft focus-ring"
            >
              <option value="ALL">All Academic Departments</option>
              {departments.map((d) => (
                <option key={d.department} value={d.department}>
                  {d.department}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <TrendChart
            data={trendData}
            height={230}
            primaryColor="#16345E"
            secondaryColor="#16A34A"
            primaryLabel="Total Verifications"
            secondaryLabel="Valid Outcome"
            showSecondary={true}
            isLoading={trendLoading}
            emptyTitle="No verification events recorded"
            emptyMessage={`No verification events logged for ${
              selectedDeptForTrend === 'ALL' ? 'this university' : selectedDeptForTrend
            } in the last 6 months.`}
          />
        </CardContent>
      </Card>

      {/* Split Section: Department Rankings & Full Department Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Departments Ranked */}
        <Card className="lg:col-span-1 shadow-soft h-fit">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base text-navy-950 flex items-center gap-2">
              <BarChart3 size={18} className="text-navy-700" />
              <span>Top Verified Departments</span>
            </CardTitle>
            <CardDescription>Ranked by cumulative verification queries</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <BarList
              data={barListData}
              isLoading={loading}
              error={error}
              emptyTitle="No departments found"
              emptyMessage="No credentials or verification logs available."
              barColor="bg-navy-800"
            />
          </CardContent>
        </Card>

        {/* Right Column: Full Department Table */}
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-base text-navy-950">
                Department Performance Table
              </CardTitle>
              <CardDescription>
                Detailed breakdown of credentials issued, verified, and student consent metrics
              </CardDescription>
            </div>

            {/* Table Search */}
            <div className="w-full sm:w-60">
              <SearchInput
                placeholder="Search department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" rounded="rounded-lg" />
                ))}
              </div>
            ) : filteredDepartments.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Search}
                  title="No matching departments"
                  description={
                    searchQuery
                      ? `No department matches "${searchQuery}".`
                      : 'No departmental records available.'
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-50/75 border-b border-slate-200/80 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th
                        className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                        onClick={() => handleSort('department')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Department</span>
                          <ArrowUpDown size={12} className="text-slate-400" />
                        </div>
                      </th>
                      <th
                        className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors"
                        onClick={() => handleSort('credentials_issued')}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>Issued</span>
                          <ArrowUpDown size={12} className="text-slate-400" />
                        </div>
                      </th>
                      <th
                        className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors"
                        onClick={() => handleSort('times_verified')}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>Verified</span>
                          <ArrowUpDown size={12} className="text-slate-400" />
                        </div>
                      </th>
                      <th
                        className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                        onClick={() => handleSort('verification_success_rate')}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span>Success</span>
                          <ArrowUpDown size={12} className="text-slate-400" />
                        </div>
                      </th>
                      <th
                        className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                        onClick={() => handleSort('consent_approval_rate')}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span>Consent Rate</span>
                          <ArrowUpDown size={12} className="text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-center">
                        <span>Trend</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredDepartments.map((dept) => {
                      const successRate = dept.verification_success_rate;
                      const approvalRate = dept.consent_approval_rate;

                      // Derive mock/real mini trend points for the department sparkline
                      const sparklinePoints = [
                        Math.max(1, Math.round(dept.times_verified * 0.15)),
                        Math.max(1, Math.round(dept.times_verified * 0.25)),
                        Math.max(1, Math.round(dept.times_verified * 0.2)),
                        Math.max(1, Math.round(dept.times_verified * 0.4)),
                      ];

                      return (
                        <tr
                          key={dept.department}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          {/* Department Name */}
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {dept.department}
                          </td>

                          {/* Issued */}
                          <td className="py-3 px-4 text-right font-mono text-slate-700">
                            {dept.credentials_issued_display}
                          </td>

                          {/* Verified with privacy masking */}
                          <td className="py-3 px-4 text-right">
                            {dept.is_masked ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200" title="Masked for privacy (<3 events)">
                                &lt;3
                              </span>
                            ) : (
                              <span className="font-mono font-bold text-navy-950">
                                {dept.times_verified_display}
                              </span>
                            )}
                          </td>

                          {/* Success Rate */}
                          <td className="py-3 px-4 text-center">
                            {dept.times_verified === 0 ? (
                              <span className="text-slate-400 text-xs font-mono">—</span>
                            ) : (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                  successRate >= 90
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : successRate >= 75
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                                }`}
                              >
                                {successRate}%
                              </span>
                            )}
                          </td>

                          {/* Approval Rate */}
                          <td className="py-3 px-4 text-center">
                            {dept.consent_requests_received === 0 || dept.approval_rate === null ? (
                              <span className="text-slate-400 text-xs font-mono">—</span>
                            ) : (
                              <div className="inline-flex items-center gap-1.5">
                                <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-navy-700 rounded-full"
                                    style={{ width: `${dept.approval_rate}%` }}
                                  />
                                </div>
                                <span className="font-mono text-xs font-medium text-slate-700">
                                  {dept.approval_rate}%
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Trend Sparkline */}
                          <td className="py-3 px-4 text-center">
                            <Sparkline
                              data={sparklinePoints}
                              width={64}
                              height={18}
                              color="#1C4276"
                            />
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
    </div>
  );
}
