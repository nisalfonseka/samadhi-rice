export default function Loading() {
  return (
    <div className="bg-paper min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-[6.75rem] sm:px-8 sm:pb-24 sm:pt-36">
        {/* breadcrumb */}
        <div className="shimmer mb-4 h-3 w-56 rounded sm:mb-8 sm:h-4 sm:w-72" />

        <div className="grid gap-6 sm:gap-10 lg:grid-cols-2 lg:gap-16">
          {/* gallery */}
          <div className="flex w-full flex-col gap-3 sm:gap-5">
            <div className="shimmer h-[16rem] w-full rounded-[1.5rem] sm:h-[28rem] sm:rounded-[2rem] md:h-[30rem]" />
            <div className="flex gap-2 sm:gap-3 sm:px-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="shimmer h-12 w-12 shrink-0 rounded-xl sm:h-16 sm:w-16 sm:rounded-2xl" />
              ))}
            </div>
          </div>

          {/* details */}
          <div className="flex flex-col">
            <div className="shimmer h-3 w-32 rounded sm:h-4 sm:w-40" />
            <div className="shimmer mt-2 h-7 w-2/3 rounded sm:mt-3 sm:h-11" />
            <div className="shimmer mt-3 h-3 w-40 rounded sm:h-4 sm:w-48" />

            <div className="mt-4 flex flex-col gap-2 sm:mt-6">
              <div className="shimmer h-3 w-full rounded sm:h-4" />
              <div className="shimmer h-3 w-full rounded sm:h-4" />
              <div className="shimmer h-3 w-4/5 rounded sm:h-4" />
            </div>

            {/* buy panel */}
            <div className="mt-6 rounded-3xl border border-husk/10 bg-rice-50 p-4 sm:mt-8 sm:p-6">
              <div className="shimmer h-3 w-28 rounded" />
              <div className="mt-4 flex gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="shimmer h-3 w-full rounded-full" />
                ))}
              </div>
              <div className="mt-6 flex items-end justify-between gap-3">
                <div className="shimmer h-9 w-28 rounded sm:h-11 sm:w-36" />
                <div className="shimmer h-4 w-24 rounded" />
              </div>
              <div className="shimmer mt-5 h-12 w-full rounded-full sm:h-14" />
              <div className="shimmer mx-auto mt-4 h-3 w-56 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
