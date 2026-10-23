import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Register from './Register.jsx';
import { Button, Input, PasswordInput, Alert } from '@ethiocred/ui';
import { Mail, Fingerprint, LogIn } from 'lucide-react';

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
      setError(err.response?.data?.message || 'Student not found with this Fayda ID');
    } finally {
      setSubmitting(false);
    }
  };

  if (showRegister) {
    return <Register onBack={() => { setShowRegister(false); setError(''); }} />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-navy-950 font-display">
          Sign In to Your Wallet
        </h2>
        <p className="text-sm text-slate-500">
          Access your digital academic records and consent requests.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
        <button
          type="button"
          onClick={() => { setActiveTab('email'); setError(''); }}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all duration-150 focus-ring ${
            activeTab === 'email'
              ? 'bg-white text-navy-950 shadow-soft'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mail size={15} />
          <span>Email Login</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('fayda'); setError(''); }}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all duration-150 focus-ring ${
            activeTab === 'fayda'
              ? 'bg-white text-navy-950 shadow-soft'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Fingerprint size={15} />
          <span>Fayda ID Login</span>
        </button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {activeTab === 'email' ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            placeholder="student@example.com"
          />

          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2"
            isLoading={submitting}
            loadingText="Authenticating..."
            rightIcon={LogIn}
          >
            Sign In
          </Button>
        </form>
      ) : (
        <form onSubmit={handleFaydaSubmit} className="space-y-4">
          <Input
            id="faydaId"
            label="National Fayda ID"
            type="text"
            value={faydaId}
            onChange={(e) => setFaydaId(e.target.value)}
            placeholder="FAYDA-001"
            helperText="Enter your official Ethiopian National ID number."
            required
            autoFocus
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2"
            isLoading={submitting}
            loadingText="Verifying Fayda Identity..."
            rightIcon={Fingerprint}
          >
            Sign In with Fayda
          </Button>
        </form>
      )}

      <div className="pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          New student?{' '}
          <button
            type="button"
            onClick={() => { setShowRegister(true); setError(''); }}
            className="font-semibold text-navy-900 hover:underline focus-ring rounded"
          >
            Create your wallet
          </button>
        </p>
      </div>
    </div>
  );
}
