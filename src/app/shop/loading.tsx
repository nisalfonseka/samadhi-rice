export default function Loading() {
  return (
    <div className="bg-paper min-h-screen">
      <header className="mx-auto max-w-7xl px-4 pb-4 pt-[6.75rem] sm:px-8 sm:pb-10 sm:pt-36">
        <div className="shimmer mb-2 h-3 w-28 rounded sm:mb-6 sm:h-4 sm:w-32" />
        <div className="shimmer h-6 w-3/4 rounded sm:h-12 sm:w-2/3" />
        <div className="shimmer mt-2 h-6 w-1/2 rounded sm:mt-4 sm:h-12" />
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-8 sm:pb-24">
        {/* search + filter row */}
        <div className="flex items-center gap-2 sm:max-w-md">
          <div className="shimmer h-[2.6rem] flex-1 rounded-full sm:h-12" />
          <div className="shimmer h-[2.6rem] w-[2.6rem] shrink-0 rounded-full sm:hidden" />
        </div>

        {/* category rail */}
        <div className="mt-3 flex gap-1.5 overflow-hidden sm:mt-6 sm:gap-2">
          {[72, 132, 96, 104].map((w) => (
            <div key={w} className="shimmer h-8 shrink-0 rounded-full sm:h-10" style={{ width: w }} />
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 min-[560px]:grid-cols-3 sm:mt-12 sm:gap-6 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-3xl border border-husk/10 bg-rice-50"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="shimmer aspect-[5/4] w-full" />
              <div className="flex flex-col gap-2 p-3 sm:p-5">
                <div className="shimmer h-4 w-3/4 rounded sm:h-5" />
                <div className="shimmer h-3 w-1/2 rounded" />
                <div className="mt-2 flex items-end justify-between gap-2">
                  <div className="shimmer h-5 w-16 rounded sm:h-6 sm:w-20" />
                  <div className="shimmer h-9 w-9 shrink-0 rounded-full sm:h-12 sm:w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
