import { useMemo, useState } from 'react';
import { formatDateTime } from '@ethiocred/utils';
import Badge from '../../components/Badge/Badge.jsx';
import Table from '../../components/Table/Table.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import { getVerificationResults } from '../../utils/verificationCache.js';

export default function History() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const results = getVerificationResults();

  const filtered = useMemo(() => {
    if (filter === 'valid') return results.filter((r) => r.valid);
    if (filter === 'invalid') return results.filter((r) => !r.valid);
    return results;
  }, [results, filter]);

  const columns = [
    { key: 'serial_number', label: 'Serial' },
    { key: 'holder_name', label: 'Student Name' },
    { key: 'institution_name', label: 'Institution' },
    {
      key: 'verifiedAt',
      label: 'Date',
      render: (row) => formatDateTime(row.verifiedAt),
    },
    {
      key: 'valid',
      label: 'Result',
      render: (row) =>
        row.valid ? (
          <Badge variant="green">VALID</Badge>
        ) : (
          <Badge variant="red">INVALID</Badge>
        ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Verification History</h2>
        <div className="flex gap-2">
          {['all', 'valid', 'invalid'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg capitalize ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">No verification history yet. Run a verification to see results here.</p>
      ) : (
        <Table
          columns={columns}
          data={filtered}
          onRowClick={setSelected}
        />
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Verification Details"
        cancelLabel="Close"
      >
        {selected && (
          <div className="space-y-2 text-sm">
            <p><strong>Serial:</strong> {selected.serial_number}</p>
            <p><strong>Student:</strong> {selected.holder_name}</p>
            <p><strong>Institution:</strong> {selected.institution_name}</p>
            <p><strong>Result:</strong> {selected.valid ? 'VALID' : 'INVALID'}</p>
            <p><strong>Reason:</strong> {selected.reason}</p>
            {selected.step && <p><strong>Failed Step:</strong> {selected.step}</p>}
            <p><strong>Verified At:</strong> {formatDateTime(selected.verifiedAt)}</p>
            {selected.credential && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p><strong>Degree:</strong> {selected.credential.degree_name}</p>
                <p><strong>GPA:</strong> {selected.credential.gpa}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
