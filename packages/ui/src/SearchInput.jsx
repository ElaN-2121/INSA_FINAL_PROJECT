import { Search, X } from 'lucide-react';

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
}) {
  return (
    <div className={`relative ${className}`.trim()}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        size={17}
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-900 transition-all placeholder:text-slate-400 hover:border-slate-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-600/20 shadow-2xs"
      />
      {value && (
        <button
          type="button"
          onClick={onClear ? onClear : () => onChange({ target: { value: '' } })}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md focus-ring transition-colors"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
