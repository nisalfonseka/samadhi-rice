import { getAnalytics } from "@/lib/services/admin.service";
import { AreaChart, BarChart, DonutChart } from "@/components/admin/Charts";
import { formatLKR } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#d8b863",
  CONFIRMED: "#97ada4",
  PROCESSING: "#b7c79c",
  SHIPPED: "#4f6839",
  DELIVERED: "#3d5330",
  CANCELLED: "#8a5d3b",
};

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-husk/10 bg-rice-50 p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-husk-soft">{label}</p>
      <p className="mt-2 font-display text-3xl text-husk">{value}</p>
    </div>
  );
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-husk/10 bg-rice-50 p-5">
      <div className="mb-4">
        <h2 className="font-display text-xl text-husk">{title}</h2>
        {sub && <p className="text-xs text-husk-soft">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

export default async function AnalyticsPage() {
  const a = await getAnalytics(14);
  const avgOrder = a.periodOrders > 0 ? Math.round(a.periodRevenue / a.periodOrders) : 0;
  const topMax = Math.max(1, ...a.topProducts.map((p) => p.revenue));

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-husk">Analytics</h1>
        <p className="mt-1 text-husk-soft">Last 14 days.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Revenue (14d)" value={formatLKR(a.periodRevenue)} />
        <Kpi label="Orders (14d)" value={String(a.periodOrders)} />
        <Kpi label="Avg. order" value={formatLKR(avgOrder)} />
        <Kpi label="New customers" value={String(a.periodCustomers)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Revenue trend" sub={`Latest: ${formatLKR(a.revenue.at(-1) ?? 0)}`}>
          <AreaChart data={a.revenue} />
        </Panel>
        <Panel title="Orders per day" sub={`Latest: ${a.orders.at(-1) ?? 0}`}>
          <BarChart data={a.orders} />
        </Panel>
        <Panel title="Order status" sub="All time">
          <DonutChart
            segments={a.statusBreakdown.map((s) => ({
              label: s.status,
              value: s.count,
              color: STATUS_COLORS[s.status] ?? "#4f6839",
            }))}
          />
        </Panel>
        <Panel title="Top products" sub="By revenue, all time">
          {a.topProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-husk-soft">No sales yet.</p>
          ) : (
            <ul className="space-y-3">
              {a.topProducts.map((p) => (
                <li key={p.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-husk">{p.name}</span>
                    <span className="text-husk-soft">{formatLKR(p.revenue)} · {p.qty}u</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-rice-200">
                    <div className="h-full rounded-full bg-paddy-600" style={{ width: `${(p.revenue / topMax) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
