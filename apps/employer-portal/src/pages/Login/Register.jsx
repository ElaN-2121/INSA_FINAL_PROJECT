import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button, Input, PasswordInput, Alert } from '@ethiocred/ui';
import { ArrowLeft, Building2 } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register({ onBack }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateConfirmPassword = () => {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      return false;
    }
    setConfirmError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !companyName.trim() || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        company_name: companyName.trim(),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-navy-950 font-display">
          Register Organization
        </h2>
        <p className="text-sm text-slate-500">
          Create an employer verification account to verify candidate credentials.
        </p>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="companyName"
          label="Company / Organization Name"
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          placeholder="e.g. Commercial Bank of Ethiopia"
        />

        <Input
          id="fullName"
          label="Contact Person Name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="HR Representative Name"
        />

        <Input
          id="email"
          label="Corporate Work Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="hr@company.com"
        />

        <PasswordInput
          id="password"
          label="Password (min 8 characters)"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (confirmPassword) setConfirmError(e.target.value !== confirmPassword ? 'Passwords do not match.' : '');
          }}
          required
          autoComplete="new-password"
          placeholder="Create a secure password"
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setConfirmError(password !== e.target.value ? 'Passwords do not match.' : '');
          }}
          onBlur={validateConfirmPassword}
          error={confirmError}
          required
          autoComplete="new-password"
          placeholder="Confirm your password"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={submitting}
          loadingText="Registering Organization..."
          rightIcon={Building2}
        >
          Create Employer Account
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors focus-ring rounded"
        >
          <ArrowLeft size={14} />
          <span>Back to sign in</span>
        </button>

        <p className="text-xs text-slate-500">
          Already registered?{' '}
          <button
            type="button"
            onClick={onBack}
            className="font-semibold text-navy-900 hover:underline focus-ring rounded"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
