export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-husk/10" />
        <div className="h-4 w-72 rounded bg-husk/10" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl border border-husk/10 bg-rice-50" />
        ))}
      </div>
      <div className="space-y-3 rounded-2xl border border-husk/10 bg-rice-50 p-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-husk/8" />
        ))}
      </div>
    </div>
  );
}
