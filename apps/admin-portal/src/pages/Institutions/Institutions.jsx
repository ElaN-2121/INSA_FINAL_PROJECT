import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Building2,
  Copy,
  Plus,
  UserPlus,
  Check,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  KeyRound,
  Lock,
  AlertCircle
} from 'lucide-react';
import { Badge, Loader, Table, Button, Modal, PageHeader, SearchInput, EmptyState } from '@ethiocred/ui';
import { get, post, patch } from '../../services/api.js';
import { formatDate } from '../../utils/formatDate.js';

function statusBadge(status) {
  const map = {
    PENDING: 'yellow',
    UNDER_REVIEW: 'blue',
    ACTIVE: 'green',
    SUSPENDED: 'red',
    REVOKED: 'red',
  };
  return <Badge variant={map[status] || 'gray'}>{status}</Badge>;
}

export default function Institutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    organization_fayda_id: '',
    registration_number: '',
  });
  const [registerResult, setRegisterResult] = useState(null);
  const [registerSubmitting, setRegisterSubmitting] = useState(false);

  const [registrarOpen, setRegistrarOpen] = useState(false);
  const [registrarInstitution, setRegistrarInstitution] = useState(null);
  const [registrarForm, setRegistrarForm] = useState({ full_name: '', email: '' });
  const [registrarResult, setRegistrarResult] = useState(null);
  const [registrarSubmitting, setRegistrarSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadInstitutions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await get('/admin/institutions');
      setInstitutions(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load institutions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstitutions();
  }, [loadInstitutions]);

  const filteredInstitutions = useMemo(() => {
    const q = search.toLowerCase().trim();
    return institutions.filter((inst) => {
      const matchesSearch =
        !q ||
        inst.name?.toLowerCase().includes(q) ||
        inst.registration_number?.toLowerCase().includes(q) ||
        inst.organization_fayda_id?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PENDING' && ['PENDING', 'UNDER_REVIEW'].includes(inst.status)) ||
        inst.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [institutions, search, statusFilter]);

  const handleApprove = async (id) => {
    setActionError('');
    try {
      await patch(`/admin/institutions/${id}/approve`);
      await loadInstitutions();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve institution');
    }
  };

  const handleSuspend = async (institution) => {
    if (!window.confirm(`Suspend "${institution.name}"? Registrars will lose issuance access immediately.`)) {
      return;
    }
    setActionError('');
    try {
      await patch(`/admin/institutions/${institution.id}/suspend`);
      await loadInstitutions();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to suspend institution');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterSubmitting(true);
    setActionError('');
    try {
      const { data } = await post('/admin/institutions', registerForm);
      setRegisterResult(data.data);
      await loadInstitutions();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to register institution');
    } finally {
      setRegisterSubmitting(false);
    }
  };

  const handleCreateRegistrar = async (e) => {
    e.preventDefault();
    setRegistrarSubmitting(true);
    setActionError('');
    try {
      const { data } = await post(`/institutions/${registrarInstitution.id}/registrars`, registrarForm);
      setRegistrarResult(data.data);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create registrar');
    } finally {
      setRegistrarSubmitting(false);
    }
  };

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeRegisterModal = () => {
    setRegisterOpen(false);
    setRegisterForm({ name: '', organization_fayda_id: '', registration_number: '' });
    setRegisterResult(null);
  };

  const closeRegistrarModal = () => {
    setRegistrarOpen(false);
    setRegistrarInstitution(null);
    setRegistrarForm({ full_name: '', email: '' });
    setRegistrarResult(null);
    setCopied(false);
  };

  const columns = [
    {
      key: 'name',
      label: 'Institution Name',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.name}</p>
          <p className="font-mono text-xs text-slate-500">{row.organization_fayda_id || 'No Org Fayda ID'}</p>
        </div>
      ),
    },
    {
      key: 'registration_number',
      label: 'MoE Registration',
      render: (row) => (
        <span className="font-mono text-xs font-medium text-slate-700">
          {row.registration_number || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trust Status',
      render: (row) => statusBadge(row.status),
    },
    {
      key: 'registrar_count',
      label: 'Registrars',
      render: (row) => (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
          {row.registrar_count ?? 0}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Enrolled Date',
      render: (row) => (
        <span className="text-xs text-slate-500">{formatDate(row.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {['PENDING', 'UNDER_REVIEW'].includes(row.status) && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleApprove(row.id)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1"
            >
              Approve Accreditation
            </Button>
          )}
          {row.status === 'ACTIVE' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRegistrarInstitution(row);
                  setRegistrarOpen(true);
                  setRegistrarResult(null);
                  setRegistrarForm({ full_name: '', email: '' });
                }}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs py-1"
              >
                <UserPlus className="mr-1 h-3.5 w-3.5 text-navy-800" />
                Add Registrar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuspend(row)}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs py-1"
              >
                Suspend
              </Button>
            </>
          )}
          {row.status === 'SUSPENDED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApprove(row.id)}
              className="border-slate-300 text-slate-700 text-xs py-1"
            >
              Reactivate
            </Button>
          )}
        </div>
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
    <div className="space-y-6">
      <PageHeader
        title="Trust Registry & Accredited Institutions"
        description="Federal registry of verified universities authorized to issue cryptographically signed credentials."
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setRegisterOpen(true);
              setRegisterResult(null);
              setRegisterForm({ name: '', organization_fayda_id: '', registration_number: '' });
            }}
            className="bg-navy-900 hover:bg-navy-800 text-white shadow-sm"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Register New Institution
          </Button>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {actionError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p>{actionError}</p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="w-full sm:max-w-xs">
          <SearchInput
            placeholder="Search university, registration #..."
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
            { id: 'ALL', label: `All (${institutions.length})` },
            { id: 'ACTIVE', label: `Active (${institutions.filter((i) => i.status === 'ACTIVE').length})` },
            { id: 'PENDING', label: `Pending (${institutions.filter((i) => ['PENDING', 'UNDER_REVIEW'].includes(i.status)).length})` },
            { id: 'SUSPENDED', label: `Suspended (${institutions.filter((i) => i.status === 'SUSPENDED').length})` },
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

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {filteredInstitutions.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={search || statusFilter !== 'ALL' ? 'No matching institutions' : 'No institutions registered'}
            description={
              search || statusFilter !== 'ALL'
                ? 'Try adjusting your search query or filter tags.'
                : 'Click "Register New Institution" to enroll higher education institutions into the Trust Registry.'
            }
          />
        ) : (
          <Table columns={columns} data={filteredInstitutions} />
        )}
      </div>

      {/* Register Institution Modal */}
      <Modal
        isOpen={registerOpen}
        onClose={closeRegisterModal}
        title={registerResult ? 'Institution Registered Successfully' : 'Register Higher Education Institution'}
      >
        {!registerResult ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Institution Legal Name *
              </label>
              <input
                required
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                placeholder="e.g. Addis Ababa University"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Organization Fayda National ID
              </label>
              <input
                value={registerForm.organization_fayda_id}
                onChange={(e) => setRegisterForm({ ...registerForm, organization_fayda_id: e.target.value })}
                placeholder="e.g. FAYDA-ORG-1004"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Ministry of Education Registration Number
              </label>
              <input
                value={registerForm.registration_number}
                onChange={(e) => setRegisterForm({ ...registerForm, registration_number: e.target.value })}
                placeholder="e.g. MOE/HEI/2026/041"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="md" onClick={closeRegisterModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={registerSubmitting}
                className="bg-navy-900 hover:bg-navy-800 text-white"
              >
                {registerSubmitting ? 'Generating Keys & Enrolling…' : 'Enroll Institution'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
              <p className="font-semibold text-emerald-950">RSA-2048 Asymmetric Key Pair Generated</p>
              <p className="mt-0.5">
                The institution is now enrolled in status PENDING. Approve it in the list to enable registrar credentials.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Generated RSA Public Key
              </label>
              <div className="relative">
                <pre className="max-h-40 overflow-x-auto rounded-xl bg-navy-950 p-3.5 text-xs font-mono text-emerald-300 border border-navy-800">
                  {registerResult.public_key}
                </pre>
                <button
                  type="button"
                  onClick={() => copyToClipboard(registerResult.public_key)}
                  className="absolute right-2 top-2 rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={closeRegisterModal}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white"
            >
              Done
            </Button>
          </div>
        )}
      </Modal>

      {/* Add Registrar Modal */}
      <Modal
        isOpen={registrarOpen}
        onClose={registrarResult ? undefined : closeRegistrarModal}
        title={registrarResult ? 'Registrar Account Provisioned' : `Add Registrar: ${registrarInstitution?.name}`}
      >
        {!registrarResult ? (
          <form onSubmit={handleCreateRegistrar} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Registrar Officer Full Name *
              </label>
              <input
                required
                value={registrarForm.full_name}
                onChange={(e) => setRegistrarForm({ ...registrarForm, full_name: e.target.value })}
                placeholder="e.g. Dr. Tewodros Haile"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Official Institutional Email *
              </label>
              <input
                required
                type="email"
                value={registrarForm.email}
                onChange={(e) => setRegistrarForm({ ...registrarForm, email: e.target.value })}
                placeholder="e.g. registrar@aau.edu.et"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="md" onClick={closeRegistrarModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={registrarSubmitting}
                className="bg-navy-900 hover:bg-navy-800 text-white"
              >
                {registrarSubmitting ? 'Provisioning…' : 'Create Registrar'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-950">One-Time Temporary Password</p>
                <p className="mt-0.5">
                  This temporary credential will not be stored in plaintext. Copy it and transmit it securely to the registrar officer.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Registrar officer <strong>{registrarResult.user?.full_name}</strong> ({registrarResult.user?.email}) has been provisioned.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Temporary Password
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-xl bg-slate-100 p-3.5 text-center text-xl font-mono font-bold tracking-wider text-slate-900 border border-slate-200">
                  {registrarResult.temporaryPassword}
                </code>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => copyToClipboard(registrarResult.temporaryPassword)}
                  className="border-slate-300 text-slate-700"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {copied && <p className="mt-1 text-xs text-emerald-600 font-medium">Copied password to clipboard!</p>}
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={closeRegistrarModal}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white"
            >
              Done, I have safely stored the password
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
