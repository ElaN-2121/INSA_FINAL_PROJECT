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
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">User Wallet</h2>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => { setActiveTab('email'); setError(''); }}
          className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'email'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Email Login
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('fayda'); setError(''); }}
          className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'fayda'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Fayda ID Login
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {activeTab === 'email' ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleFaydaSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fayda ID</label>
            <input
              type="text"
              value={faydaId}
              onChange={(e) => setFaydaId(e.target.value)}
              placeholder="FAYDA-001"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {submitting ? 'Signing in...' : 'Sign In with Fayda'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        New here?{' '}
        <button
          type="button"
          onClick={() => { setShowRegister(true); setError(''); }}
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          Create your wallet
        </button>
      </p>
    </div>
  );
}
