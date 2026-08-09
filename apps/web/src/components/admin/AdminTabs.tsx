import { cn } from '../../lib/utils';

interface AdminTabsProps<T extends string> {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function AdminTabs<T extends string>({
  tabs,
  value,
  onChange,
}: AdminTabsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-4 py-2 rounded-full text-[13px] font-black uppercase tracking-wider transition-all border-b-[4px] active:border-b-0 active:translate-y-[4px]',
            value === tab.value
              ? 'bg-primary-500 text-white border-primary-600'
              : 'bg-surface-100 text-surface-600 border-surface-300'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
