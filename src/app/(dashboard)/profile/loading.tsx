export default function ProfileLoading() {
  return (
    <div>
      <div className="skeleton h-8 w-28 mb-2" />
      <div className="skeleton h-4 w-48 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col items-center">
          <div className="skeleton w-20 h-20 rounded-2xl mb-4" />
          <div className="skeleton h-5 w-36 mb-2" />
          <div className="skeleton h-4 w-48 mb-6" />
          <div className="w-full space-y-3 pt-4 border-t border-[var(--border-color)]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-4 w-full" />
            ))}
          </div>
        </div>

        <div className="glass-card p-6 lg:col-span-2">
          <div className="skeleton h-5 w-44 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={i === 4 ? "sm:col-span-2" : ""}>
                <div className="skeleton h-3 w-24 mb-2" />
                <div className="skeleton h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <div className="skeleton h-10 w-20 rounded-xl" />
            <div className="skeleton h-10 w-28 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
