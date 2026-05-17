export default function SettingsLoading() {
  return (
    <div>
      <div className="skeleton h-8 w-32 mb-2" />
      <div className="skeleton h-4 w-56 mb-8" />

      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-[var(--surface)] w-fit">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-28 rounded-lg" />
        ))}
      </div>

      <div className="glass-card p-6">
        <div className="skeleton h-5 w-24 mb-6" />
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
