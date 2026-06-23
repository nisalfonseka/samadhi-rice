import { Suspense } from "react";

export default function Loading() {
  return (
    <div className="bg-paper min-h-screen">
      <header className="mx-auto max-w-7xl px-5 pb-10 pt-32 sm:px-8 sm:pt-36 animate-pulse">
        <div className="h-4 w-32 rounded bg-husk/10 mb-6" />
        <div className="h-4 w-32 rounded bg-clay-500/20 mb-3" />
        <div className="h-12 w-2/3 rounded bg-husk/10" />
        <div className="mt-4 h-16 w-3/4 rounded bg-husk/10" />
        <div className="mt-8 h-12 w-full max-w-md rounded-xl bg-husk/10" />
      </header>

      <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="group mb-12 block overflow-hidden rounded-3xl border border-husk/10 bg-rice-50 animate-pulse">
          <div className="grid gap-0 md:grid-cols-[1.1fr_1fr] h-[400px]">
            <div className="bg-husk/5" />
            <div className="p-8 sm:p-10 flex flex-col justify-center space-y-4">
              <div className="h-4 w-24 rounded bg-husk/10" />
              <div className="h-8 w-3/4 rounded bg-husk/10" />
              <div className="h-16 w-full rounded bg-husk/10" />
              <div className="h-4 w-32 rounded bg-husk/10 mt-auto" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-3xl bg-husk/5 border border-husk/10" />
          ))}
        </div>
      </div>
    </div>
  );
}
