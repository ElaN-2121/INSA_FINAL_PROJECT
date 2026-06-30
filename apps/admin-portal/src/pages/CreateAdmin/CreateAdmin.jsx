import { useState } from 'react';
import { UserPlus } from 'lucide-react';
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
        'Admin account created successfully. They can now log in at this portal with the credentials you set.'
      );
      setForm({ full_name: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <UserPlus size={24} />
          Create Admin Account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Create a new EthioCred administrator. Admin accounts cannot self-register.
        </p>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      )}
      {success && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700">Full Name</label>
          <input
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input
            required
            type="password"
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          />
          <p className="mt-1 text-xs text-slate-500">Must be at least 8 characters</p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Creating…' : 'Create Admin'}
        </button>
      </form>
    </div>
  );
}
