import { useEffect, useState } from 'react';
import { UserCircle } from 'lucide-react';
import { get, patch } from '@ethiocred/utils';
import Badge from '../../components/Badge/Badge.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { useAuth } from '../../context/AuthContext.jsx';

function getInitials(name) {
  return (
    name
      ?.split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  );
}

export default function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [credentialCount, setCredentialCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingEmail, setEditingEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([get('/auth/me'), get('/credentials/mine')])
      .then(([meRes, credsRes]) => {
        setProfile(meRes.data.data);
        setEmail(meRes.data.data.email || '');
        setCredentialCount((credsRes.data.data || []).length);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveEmail = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await patch('/auth/profile', { email: email.trim() });
      setProfile((prev) => ({ ...prev, email: email.trim() }));
      setEditingEmail(false);
      setMessage('Email updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update email. Profile update may not be available yet.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-20 text-center text-red-600">{error || 'Profile not found'}</div>
    );
  }

  const displayName = profile.full_name || authUser?.full_name || 'Student';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
          <UserCircle size={24} className="text-blue-700" />
          My Profile
        </h2>
      </div>

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">{message}</div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col items-center border-b border-gray-100 bg-gray-50 px-6 py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
            {getInitials(displayName)}
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-900">{displayName}</h3>
          <div className="mt-2">
            <Badge variant="blue">{profile.role || 'STUDENT'}</Badge>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Fayda ID</p>
            <p className="mt-1 font-mono text-sm text-gray-900">{profile.fayda_id || '—'}</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</p>
              {!editingEmail && (
                <button
                  type="button"
                  onClick={() => setEditingEmail(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
              )}
            </div>
            {editingEmail ? (
              <div className="mt-2 flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSaveEmail}
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingEmail(false);
                    setEmail(profile.email);
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Account Created</p>
            <p className="mt-1 text-sm text-gray-900">{formatDate(profile.created_at)}</p>
          </div>

          <div className="rounded-lg bg-indigo-50 p-4">
            <p className="text-sm font-medium text-indigo-900">
              {credentialCount} credential{credentialCount !== 1 ? 's' : ''} in your wallet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
