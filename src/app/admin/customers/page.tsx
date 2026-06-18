import Link from "next/link";
import { getCustomers } from "@/lib/services/admin.service";
import { formatLKR } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = await getCustomers(q?.trim() || undefined);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl text-husk">Customers</h1>
        <p className="mt-1 text-husk-soft">{customers.length} registered customers.</p>
      </header>

      <form className="mb-6 max-w-sm" action="/admin/customers" method="get">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name or email…"
          className="ctrl"
        />
      </form>

      {customers.length === 0 ? (
        <div className="rounded-2xl border border-husk/10 bg-rice-50 px-6 py-16 text-center text-husk-soft">
          No customers found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-husk/10 bg-rice-50">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-husk/10 text-xs uppercase tracking-wider text-husk-soft">
              <tr>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 font-medium">Spent</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-husk/10">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-husk/[0.02]">
                  <td className="px-5 py-3">
                    <p className="font-medium text-husk">{c.name ?? "—"}</p>
                    <p className="text-xs text-husk-soft">{c.email}</p>
                  </td>
                  <td className="px-5 py-3 text-husk">{c.orderCount}</td>
                  <td className="px-5 py-3 text-husk">{formatLKR(c.totalSpent)}</td>
                  <td className="px-5 py-3">
                    {c.disabled ? (
                      <span className="rounded-full bg-clay-500/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-clay-700">
                        Disabled
                      </span>
                    ) : (
                      <span className="rounded-full bg-paddy-600/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-paddy-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="rounded-lg border border-husk/15 px-3 py-1.5 text-xs font-medium text-husk hover:border-paddy-600"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
