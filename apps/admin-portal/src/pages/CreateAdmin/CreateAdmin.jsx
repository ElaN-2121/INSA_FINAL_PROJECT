import { useState } from 'react';
import { UserPlus, ShieldCheck, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PasswordInput, Button, PageHeader } from '@ethiocred/ui';
import { post } from '../../services/api.js';

export default function CreateAdmin() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await post('/admin/create-admin', form);
      setSuccess(
        'Root administrator provisioned successfully. They can now authenticate at this console with the designated credentials.'
      );
      setForm({ full_name: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title="Provision Administrator Officer"
        description="Grant root administrative clearance to authorized personnel. Admin accounts cannot self-register."
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm space-y-5"
      >
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Administrator Full Name *
          </label>
          <input
            required
            type="text"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="e.g. Dawit Tadesse"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Official Government Email *
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="e.g. dawit.t@ethiocred.et"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Clearance Password *
          </label>
          <PasswordInput
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 8 characters with numbers and symbols"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200"
          />
          <p className="mt-1 text-xs text-slate-500">
            Must be at least 8 characters and adhere to national cryptographic clearance standards.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            className="w-full bg-navy-900 hover:bg-navy-800 text-white shadow-sm"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {submitting ? 'Provisioning Administrator…' : 'Provision Administrator'}
          </Button>
        </div>
      </form>
    </div>
  );
}
