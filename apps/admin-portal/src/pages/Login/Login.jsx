import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button, Input, PasswordInput, Alert } from '@ethiocred/ui';
import { Shield, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-white font-display">
          Administrator Sign In
        </h2>
        <p className="text-sm text-slate-400">
          Enter root credentials to access the National Trust Registry console.
        </p>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          label="Root Administrator Email"
          type="email"
          tone="dark"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          placeholder="admin@ethiocred.et"
        />

        <PasswordInput
          id="password"
          label="Security Key / Password"
          tone="dark"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="Enter master password"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2 bg-sky-600 hover:bg-sky-500 text-white border-sky-500 shadow-sm"
          isLoading={submitting}
          loadingText="Authenticating Root Clearance..."
          rightIcon={LogIn}
        >
          Sign In to Authority Console
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-800 text-center">
        <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Shield size={13} className="text-sky-400" />
          <span>All administrator actions are recorded in the audit log.</span>
        </p>
      </div>
    </div>
  );
}
