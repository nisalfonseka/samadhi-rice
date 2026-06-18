import Link from "next/link";
import { getDashboardStats, LOW_STOCK_KG } from "@/lib/services/admin.service";
import { getRecentActivity } from "@/lib/services/activity.service";
import { formatLKR } from "@/lib/pricing";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-husk/10 bg-rice-50 p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-husk-soft">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl text-husk">{value}</p>
      {hint && <p className="mt-1 text-xs text-husk-soft">{hint}</p>}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const [stats, activity] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(8),
  ]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-husk">Overview</h1>
        <p className="mt-1 text-husk-soft">
          A quick pulse on the shop today.
        </p>
      </header>

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Orders today" value={String(stats.todayOrders)} />
        <StatCard label="Revenue today" value={formatLKR(stats.todayRevenue)} />
        <StatCard
          label="Pending"
          value={String(stats.pendingOrders)}
          hint="awaiting action"
        />
        <StatCard
          label="All-time revenue"
          value={formatLKR(stats.totalRevenue)}
          hint={`${stats.totalOrders} orders`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* recent orders */}
        <section className="rounded-2xl border border-husk/10 bg-rice-50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-husk">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-paddy-700 hover:text-paddy-900">
              View all →
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-husk-soft">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-husk/10">
              {stats.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link href={`/order/${o.orderNo}`} className="font-medium text-husk hover:text-paddy-800">
                      {o.orderNo}
                    </Link>
                    <p className="truncate text-xs text-husk-soft">
                      {o.customerName} · {o.items.length} items ·{" "}
                      {new Date(o.createdAt).toLocaleDateString("en-LK", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-husk/5 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-husk-soft">
                      {o.status.toLowerCase()}
                    </span>
                    <span className="font-semibold text-husk">{formatLKR(o.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* low stock */}
        <section className="rounded-2xl border border-husk/10 bg-rice-50 p-5">
          <h2 className="mb-4 font-display text-xl text-husk">Low stock</h2>
          <p className="mb-3 text-xs text-husk-soft">Below {LOW_STOCK_KG}kg on hand.</p>
          {stats.lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-husk-soft">
              Everything is well stocked. 🌾
            </p>
          ) : (
            <ul className="space-y-2">
              {stats.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-sm text-husk hover:text-paddy-800">
                    {p.name}
                  </Link>
                  <span className={p.stockKg <= 0 ? "text-sm font-semibold text-clay-600" : "text-sm font-medium text-harvest-700"}>
                    {p.stockKg}kg
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* recent activity */}
      <section className="mt-8 rounded-2xl border border-husk/10 bg-rice-50 p-5">
        <h2 className="mb-4 font-display text-xl text-husk">Recent activity</h2>
        {activity.length === 0 ? (
          <p className="py-4 text-sm text-husk-soft">No admin activity yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {activity.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3">
                <span className="text-husk">
                  {a.action}
                  {a.entity ? <span className="text-husk-soft"> · {a.entity}</span> : null}
                </span>
                <span className="shrink-0 text-xs text-husk-soft">
                  {a.actorName ?? "—"} ·{" "}
                  {new Date(a.createdAt).toLocaleString("en-LK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
