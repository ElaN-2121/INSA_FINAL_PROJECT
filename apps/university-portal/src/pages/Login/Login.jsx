import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button, Input, PasswordInput, Alert } from '@ethiocred/ui';
import { LogIn } from 'lucide-react';

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
        <h2 className="text-2xl font-bold tracking-tight text-navy-950 font-display">
          Registrar Sign In
        </h2>
        <p className="text-sm text-slate-500">
          Authenticate to manage batches and cryptographic graduation records.
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
          label="Institutional Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          placeholder="registrar@aau.et"
        />

        <PasswordInput
          id="password"
          label="Account Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="Enter your registrar password"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={submitting}
          loadingText="Authenticating Registrar..."
          rightIcon={LogIn}
        >
          Sign In to Registrar Console
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Need registrar credentials? Contact the{' '}
          <span className="font-semibold text-slate-700">EthioCred Trust Administrator</span>.
        </p>
      </div>
    </div>
  );
}
