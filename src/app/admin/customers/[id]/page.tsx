import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomer } from "@/lib/services/admin.service";
import { toggleUserDisabled } from "@/app/admin/actions";
import { formatLKR } from "@/lib/pricing";
import AsyncButton from "@/components/admin/AsyncButton";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  const totalSpent = customer.orders.reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <nav className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-husk-soft">
        <Link href="/admin/customers" className="hover:text-paddy-700">Customers</Link>
        <span aria-hidden>/</span>
        <span className="text-husk">{customer.name ?? customer.email}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-husk">{customer.name ?? "Customer"}</h1>
          <p className="mt-1 text-husk-soft">{customer.email}{customer.phone ? ` · ${customer.phone}` : ""}</p>
          <p className="mt-1 text-sm text-husk-soft">
            {customer.orders.length} orders · {formatLKR(totalSpent)} lifetime
            {customer.disabled && <span className="ml-2 text-clay-600">· account disabled</span>}
          </p>
        </div>
        {customer.role !== "ADMIN" && (
          <AsyncButton
            action={toggleUserDisabled.bind(null, customer.id)}
            confirm={customer.disabled ? "Re-enable this account?" : "Disable this account? They won't be able to sign in."}
            className="rounded-full border border-husk/15 px-5 py-2.5 text-sm font-medium text-husk transition-colors hover:border-clay-500 hover:text-clay-600"
          >
            {customer.disabled ? "Enable account" : "Disable account"}
          </AsyncButton>
        )}
      </div>

      <h2 className="mb-3 mt-10 font-display text-xl text-husk">Orders</h2>
      {customer.orders.length === 0 ? (
        <div className="rounded-2xl border border-husk/10 bg-rice-50 px-6 py-12 text-center text-husk-soft">
          No orders yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {customer.orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-3 rounded-2xl border border-husk/10 bg-rice-50 p-4">
              <div>
                <Link href={`/admin/orders/${o.id}`} className="font-medium text-husk hover:text-paddy-800">
                  {o.orderNo}
                </Link>
                <p className="text-xs text-husk-soft">
                  {new Date(o.createdAt).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })} · {o.items.length} items
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
    </div>
  );
}
