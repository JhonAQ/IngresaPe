import { Search } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function SearchInput({
  label,
  className = '',
  ...props
}: SearchInputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400"
        />
        <input
          {...props}
          type="text"
          className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold placeholder:text-surface-400 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>
    </div>
  );
}
