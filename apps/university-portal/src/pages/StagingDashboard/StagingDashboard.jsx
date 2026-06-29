import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { get, post } from '@ethiocred/utils';
import { useAuth } from '../../context/AuthContext.jsx';
import Table from '../../components/Table/Table.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import Loader from '../../components/Loader/Loader.jsx';

export default function StagingDashboard() {
  const { batchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stagedData, setStagedData] = useState(location.state || null);
  const [institutionName, setInstitutionName] = useState('');
  const [showInvalid, setShowInvalid] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.institution_id) {
      get(`/institutions/${user.institution_id}`)
        .then(({ data }) => setInstitutionName(data.data?.name || 'Your Institution'))
        .catch(() => setInstitutionName('Your Institution'));
    }
  }, [user?.institution_id]);

  useEffect(() => {
    if (!stagedData && batchId) {
      setError('Staged batch data not found. Please upload the CSV again.');
    }
  }, [stagedData, batchId]);

  const validRows = stagedData?.valid || [];
  const invalidRows = stagedData?.invalid || [];

  const columns = [
    { key: 'full_name', label: 'Name' },
    { key: 'fayda_id', label: 'Fayda ID' },
    { key: 'degree_name', label: 'Degree' },
    { key: 'major', label: 'Major', render: (row) => row.major || '-' },
    { key: 'graduation_year', label: 'Year' },
    { key: 'gpa', label: 'GPA' },
  ];

  const invalidColumns = [
    { key: 'row', label: 'Row', render: (item) => item.row?._rowIndex || '-' },
    { key: 'name', label: 'Name', render: (item) => item.row?.full_name || '-' },
    {
      key: 'errors',
      label: 'Errors',
      render: (item) => item.errors?.join(', '),
    },
  ];

  const handleIssue = async () => {
    setShowConfirm(false);
    setIssuing(true);
    setError('');
    try {
      const { data } = await post(`/credentials/issue/${batchId}`);
      setSuccess(data.data);
      setTimeout(() => navigate('/credentials'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue credentials');
      setIssuing(false);
    }
  };

  if (!stagedData && error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/upload')}
          className="text-blue-600 hover:underline"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Credentials Issued!</h2>
        <p className="text-gray-600">
          Successfully issued {success.issued} digitally signed credential{success.issued !== 1 ? 's' : ''}.
        </p>
        <p className="text-sm text-gray-500 mt-2">Redirecting to issued credentials...</p>
      </div>
    );
  }

  if (issuing) {
    return (
      <div className="text-center py-20">
        <Loader />
        <p className="mt-4 text-gray-600 font-medium">Issuing credentials...</p>
        <p className="text-sm text-gray-500 mt-1">Generating digital signatures and storing records</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Staging Dashboard</h2>
      <p className="text-gray-500 mb-6">Review validated records before issuing credentials.</p>

      {invalidRows.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <button
            type="button"
            onClick={() => setShowInvalid(!showInvalid)}
            className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
          >
            {invalidRows.length} invalid row{invalidRows.length !== 1 ? 's' : ''} excluded —{' '}
            {showInvalid ? 'hide' : 'view'}
          </button>
          {showInvalid && (
            <div className="mt-4">
              <Table columns={invalidColumns} data={invalidRows} />
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3">
          <span className="font-semibold text-green-700">{validRows.length}</span> students ready for issuance
        </p>
        <Table columns={columns} data={validRows} emptyMessage="No valid records in this batch." />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={validRows.length === 0}
        className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold text-lg"
      >
        Issue All Credentials
      </button>

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Credential Issuance"
        onConfirm={handleIssue}
        confirmLabel="Confirm & Issue"
      >
        <p>
          You are about to issue <strong>{validRows.length}</strong> digitally signed credential
          {validRows.length !== 1 ? 's' : ''} on behalf of <strong>{institutionName}</strong>.
          This action cannot be undone. Confirm?
        </p>
      </Modal>
    </div>
  );
}
