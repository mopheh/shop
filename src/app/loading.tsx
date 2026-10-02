// Loading skeleton shown while the product grid is fetching
export default function Loading() {
  return (
    <main className="flex-1">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 h-48 sm:h-64 animate-pulse" />

      {/* Grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-8 animate-pulse" />
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700" />
              <div className="p-5 flex flex-col gap-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
