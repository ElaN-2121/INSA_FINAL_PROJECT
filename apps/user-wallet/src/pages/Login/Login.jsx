import { PasswordInput } from '@ethiocred/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Register from './Register.jsx';

const TOKEN_KEY = 'ethiocred_token';
const USER_KEY = 'ethiocred_user';

export default function Login() {
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faydaId, setFaydaId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, loginWithFayda } = useAuth();
  const navigate = useNavigate();

  const handleRoleCheck = (user) => {
    if (user.role !== 'STUDENT') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = '/unauthorized';
      return false;
    }
    return true;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (handleRoleCheck(user)) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFaydaSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await loginWithFayda(faydaId.trim());
      if (handleRoleCheck(user)) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Student not found');
    } finally {
      setSubmitting(false);
    }
  };

  if (showRegister) {
    return <Register onBack={() => { setShowRegister(false); setError(''); }} />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">User Wallet</p>
        <h2 className="mt-3 text-2xl font-bold text-gray-900">Sign in to EthioCred</h2>
        <p className="mt-2 text-sm text-gray-500">
          Access your credentials and manage verification requests.
        </p>
      </div>

      <div className="flex rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => { setActiveTab('email'); setError(''); }}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            activeTab === 'email'
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-600/20'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Email Login
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('fayda'); setError(''); }}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            activeTab === 'fayda'
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-600/20'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Fayda ID Login
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {activeTab === 'email' ? (
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoComplete="username"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleFaydaSubmit} className="space-y-5">
          <div>
            <label htmlFor="faydaId" className="mb-1 block text-sm font-medium text-gray-700">
              Fayda ID
            </label>
            <input
              id="faydaId"
              type="text"
              value={faydaId}
              onChange={(e) => setFaydaId(e.target.value)}
              placeholder="FAYDA-001"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign In with Fayda'}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-gray-600">
        New here?{' '}
        <button
          type="button"
          onClick={() => { setShowRegister(true); setError(''); }}
          className="font-medium text-blue-600 transition-colors hover:text-blue-700 focus:outline-none focus:underline"
        >
          Create your wallet
        </button>
      </p>
    </div>
  );
}
