export function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="h-8 w-3/4 bg-surface-200 rounded-xl animate-pulse" />
        <div className="h-4 w-1/2 bg-surface-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="h-28 bg-surface-200 rounded-2xl animate-pulse" />
          <div className="h-28 bg-surface-200 rounded-2xl animate-pulse" />
          <div className="h-28 bg-surface-200 rounded-2xl animate-pulse" />
          <div className="h-28 bg-surface-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
