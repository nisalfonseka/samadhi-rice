export default function Loading() {
  return (
    <div className="bg-paper min-h-screen">
      <header className="mx-auto max-w-7xl px-4 pb-6 pt-[6.75rem] sm:px-8 sm:pb-10 sm:pt-36">
        <div className="shimmer mb-2 h-3 w-28 rounded sm:mb-6 sm:h-4 sm:w-32" />
        <div className="shimmer h-7 w-3/4 rounded sm:h-12 sm:w-2/3" />
        <div className="shimmer mt-3 h-4 w-full rounded sm:mt-4 sm:h-5 sm:w-3/4" />
        <div className="shimmer mt-2 h-4 w-2/3 rounded sm:h-5 sm:w-1/2" />
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-8 sm:pb-24">
        {/* featured post */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-husk/10 bg-rice-50 sm:mb-12">
          <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
            <div className="shimmer h-48 w-full sm:h-64 md:h-[400px]" />
            <div className="flex flex-col justify-center gap-3 p-5 sm:p-10">
              <div className="shimmer h-3 w-24 rounded sm:h-4" />
              <div className="shimmer h-6 w-3/4 rounded sm:h-8" />
              <div className="shimmer h-3 w-full rounded sm:h-4" />
              <div className="shimmer h-3 w-5/6 rounded sm:h-4" />
              <div className="shimmer mt-2 h-3 w-28 rounded sm:h-4" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-3xl border border-husk/10 bg-rice-50">
              <div className="shimmer aspect-[4/3] w-full" />
              <div className="flex flex-col gap-2 p-4 sm:p-5">
                <div className="shimmer h-3 w-20 rounded" />
                <div className="shimmer h-5 w-4/5 rounded" />
                <div className="shimmer h-3 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
