import { useState, useMemo } from 'react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Calendar,
  Building2,
  User,
  GraduationCap,
  Award,
  AlertTriangle
} from 'lucide-react';
import { formatDateTime } from '@ethiocred/utils';
import { Badge, Modal, Table, SearchInput, Button, PageHeader, EmptyState } from '@ethiocred/ui';
import { getVerificationResults } from '../../utils/verificationCache.js';

export default function History() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const results = getVerificationResults();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return results.filter((r) => {
      const matchesSearch =
        !q ||
        r.holder_name?.toLowerCase().includes(q) ||
        r.serial_number?.toLowerCase().includes(q) ||
        r.institution_name?.toLowerCase().includes(q);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'valid' && r.valid) ||
        (filter === 'invalid' && !r.valid);

      return matchesSearch && matchesFilter;
    });
  }, [results, search, filter]);

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
        <p className="font-medium text-slate-900">{row.holder_name}</p>
      ),
    },
    {
      key: 'institution_name',
      label: 'Issuing University',
      render: (row) => (
        <span className="text-slate-600 text-sm">{row.institution_name}</span>
      ),
    },
    {
      key: 'verifiedAt',
      label: 'Verification Timestamp',
      render: (row) => (
        <span className="text-xs text-slate-500">{formatDateTime(row.verifiedAt)}</span>
      ),
    },
    {
      key: 'valid',
      label: 'Verdict',
      render: (row) =>
        row.valid ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            VALID
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800 border border-rose-200">
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
            INVALID
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification Audit Trail"
        description="Immutable cryptographic verification logs executed in this browser environment."
        actions={
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Verifications: {results.length}
          </span>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="w-full sm:max-w-xs">
          <SearchInput
            placeholder="Search candidate, serial, university..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            Filter:
          </span>
          {[
            { id: 'all', label: `All (${results.length})` },
            { id: 'valid', label: `Valid (${results.filter((r) => r.valid).length})` },
            { id: 'invalid', label: `Invalid (${results.filter((r) => !r.valid).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                filter === tab.id
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title={search || filter !== 'all' ? 'No matching verifications' : 'No verification history'}
            description={
              search || filter !== 'all'
                ? 'Try modifying your search or filter tags.'
                : 'Run a verification in the Verify Credential section to generate audit records.'
            }
          />
        ) : (
          <Table
            columns={columns}
            data={filtered}
            onRowClick={setSelected}
          />
        )}
      </div>

      {/* Verification Details Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Verification Audit Dossier"
        cancelLabel="Close"
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div
              className={`rounded-xl p-4 border flex items-center gap-3 ${
                selected.valid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {selected.valid ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="h-6 w-6 text-rose-600 shrink-0" />
              )}
              <div>
                <p className="font-bold text-base">
                  {selected.valid ? 'Cryptographic Verification Passed' : 'Verification Failed'}
                </p>
                <p className="text-xs mt-0.5 opacity-90">
                  {selected.valid
                    ? 'All 7 cryptographic and accreditation assertions verified successfully.'
                    : selected.reason || 'Integrity or revocation check failure detected.'}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Candidate Name:</span>
                <span className="font-semibold text-slate-900">{selected.holder_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Credential Serial:</span>
                <span className="font-mono text-slate-900 font-semibold">{selected.serial_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Issuing University:</span>
                <span className="font-medium text-slate-900">{selected.institution_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-700">{formatDateTime(selected.verifiedAt)}</span>
              </div>
              {selected.step && (
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Failed Step:</span>
                  <span className="font-mono text-rose-600 font-bold">{selected.step}</span>
                </div>
              )}
            </div>

            {selected.credential && (
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2 text-xs text-slate-700">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Academic Record Details
                </h4>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Degree:</span>
                  <span className="font-semibold text-slate-900">{selected.credential.degree_name}</span>
                </div>
                {selected.credential.gpa && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Cumulative GPA:</span>
                    <span className="font-bold text-navy-900">{selected.credential.gpa}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
