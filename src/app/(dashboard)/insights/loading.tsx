export default function InsightsLoading() {
  return (
    <div>
      <div className="skeleton h-8 w-40 mb-2" />
      <div className="skeleton h-4 w-72 mb-8" />

      <div className="glass-card p-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-xl" />
          <div>
            <div className="skeleton h-4 w-40 mb-1" />
            <div className="skeleton h-3 w-56" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex gap-3">
              <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
              <div className="flex-1">
                <div className="skeleton h-4 w-40 mb-2" />
                <div className="skeleton h-3 w-full mb-1" />
                <div className="skeleton h-3 w-3/4 mb-2" />
                <div className="skeleton h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
