export function Table({
  columns,
  data = [],
  onRowClick,
  emptyMessage = 'No records found.',
  emptyAction,
  stickyHeader = false,
  zebra = false,
  className = '',
}) {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-soft ${className}`.trim()}>
      <table className="min-w-full divide-y divide-slate-200/80 text-left text-sm text-slate-700">
        <thead className={`bg-slate-50/90 text-xs font-semibold uppercase tracking-wider text-slate-500 ${stickyHeader ? 'sticky top-0 z-10 backdrop-blur' : ''}`}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`whitespace-nowrap px-5 py-3.5 font-semibold text-slate-600 ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white font-sans">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-sm text-slate-500"
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <p className="font-medium text-slate-600">{emptyMessage}</p>
                  {emptyAction}
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`transition-colors duration-150 ${
                  zebra && rowIndex % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                } ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-slate-50/80 active:bg-slate-100'
                    : 'hover:bg-slate-50/50'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`whitespace-nowrap px-5 py-4 text-sm text-slate-700 align-middle ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {col.render ? col.render(row, rowIndex) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
