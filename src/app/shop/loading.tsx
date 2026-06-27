import { Suspense } from "react";

export default function Loading() {
  return (
    <div className="bg-paper min-h-screen">
      <header className="mx-auto max-w-7xl px-5 pb-10 pt-32 sm:px-8 sm:pt-36 animate-pulse">
        <div className="h-4 w-32 rounded bg-husk/10 mb-6" />
        <div className="h-4 w-24 rounded bg-clay-500/20 mb-3" />
        <div className="h-12 w-2/3 rounded bg-husk/10" />
        <div className="mt-4 h-16 w-3/4 rounded bg-husk/10" />
      </header>

      <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="h-14 w-full rounded-2xl bg-husk/5 mb-12 animate-pulse" />
        <div className="grid grid-cols-2 gap-4 min-[450px]:grid-cols-3 sm:gap-6 xl:grid-cols-4 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-3xl bg-husk/5 border border-husk/10" />
          ))}
        </div>
      </div>
    </div>
  );
}
