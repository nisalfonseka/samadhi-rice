export default function AccountLoading() {
  return (
    <div className="bg-paper min-h-screen">
      <div className="mx-auto max-w-4xl px-5 pb-24 pt-32 sm:px-8 sm:pt-36">
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-24 rounded-full bg-husk/10" />
          <div className="h-10 w-64 rounded-lg bg-husk/10" />
          <div className="h-4 w-40 rounded bg-husk/10" />
        </div>
        <div className="mt-12 animate-pulse space-y-4">
          <div className="h-7 w-40 rounded bg-husk/10" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-3xl border border-husk/10 bg-rice-50" />
          ))}
        </div>
      </div>
    </div>
  );
}
