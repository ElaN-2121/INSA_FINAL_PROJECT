import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button, Input, Alert } from '@ethiocred/ui';
import { ArrowLeft, UserPlus } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register({ onBack }) {
  const [fullName, setFullName] = useState('');
  const [faydaId, setFaydaId] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !faydaId.trim() || !email.trim()) {
      setError('All fields are required.');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        full_name: fullName.trim(),
        fayda_id: faydaId.trim(),
        email: email.trim(),
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
          Create Your Student Wallet
        </h2>
        <p className="text-sm text-slate-500">
          Register to claim and hold your verified university credentials.
        </p>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="fullName"
          label="Full Legal Name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="e.g. Abebe Bekele Tessema"
        />

        <Input
          id="faydaId"
          label="National Fayda ID"
          type="text"
          value={faydaId}
          onChange={(e) => setFaydaId(e.target.value)}
          placeholder="FAYDA-001"
          helperText="Must match the National ID provided to your university registrar."
          required
        />

        <Input
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={submitting}
          loadingText="Creating wallet..."
          rightIcon={UserPlus}
        >
          Create Wallet
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
