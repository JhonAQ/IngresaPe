import { cn } from '../../lib/utils';

interface AdminTableProps {
  columns: { key: string; label: string; width?: string; className?: string }[];
  children: React.ReactNode;
  empty?: boolean;
}

export function AdminTable({ columns, children, empty }: AdminTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border-2 border-surface-200 bg-white">
      <div className="min-w-[640px]">
        <div className="flex items-center px-4 py-3 bg-surface-100 border-b-2 border-surface-200">
          {columns.map((col) => (
            <div
              key={col.key}
              className={cn(
                'text-[11px] font-black uppercase tracking-wider text-surface-500',
                col.className
              )}
              style={
                col.width ? { width: col.width, flex: 'none' } : { flex: 1 }
              }
            >
              {col.label}
            </div>
          ))}
        </div>
        {!empty && (
          <div className="divide-y divide-surface-100">{children}</div>
        )}
      </div>
    </div>
  );
}

interface AdminTableRowProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminTableRow({ children, className }: AdminTableRowProps) {
  return (
    <div
      className={cn(
        'flex items-center px-4 py-3 hover:bg-surface-50 transition-colors',
        className
      )}
    >
      {children}
    </div>
  );
}

interface AdminTableCellProps {
  children: React.ReactNode;
  width?: string;
  className?: string;
}

export function AdminTableCell({
  children,
  width,
  className,
}: AdminTableCellProps) {
  return (
    <div
      className={cn(
        'text-[13px] font-bold text-surface-700 truncate',
        className
      )}
      style={width ? { width, flex: 'none' } : { flex: 1 }}
    >
      {children}
    </div>
  );
}
