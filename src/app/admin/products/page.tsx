import Link from "next/link";
import { getAdminProducts } from "@/lib/services/admin.service";
import { formatLKR } from "@/lib/pricing";
import AdminProductActions from "@/components/admin/AdminProductActions";
import StockEdit from "@/components/admin/StockEdit";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-husk">Products</h1>
          <p className="mt-1 text-husk-soft">{products.length} varieties in the catalogue.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-paddy-800 px-5 py-2.5 text-sm font-medium text-rice-50 transition-colors hover:bg-paddy-900"
        >
          + New product
        </Link>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-husk/10 bg-rice-50">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-husk/10 text-xs uppercase tracking-wider text-husk-soft">
            <tr>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Price / kg</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-husk/10">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-husk/[0.02]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-8 w-8 shrink-0 rounded-lg"
                      style={{ background: p.grainMid ?? "#e3d2a6" }}
                    />
                    <div>
                      <p className="font-medium text-husk">{p.name}</p>
                      <p className="text-xs text-husk-soft">/{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-husk-soft">{p.category?.name ?? "—"}</td>
                <td className="px-5 py-3 text-husk">{formatLKR(p.pricePerKg)}</td>
                <td className="px-5 py-3">
                  <StockEdit id={p.id} value={p.stockKg} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {p.featured && (
                      <span className="rounded-full bg-paddy-800/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-paddy-700">
                        Featured
                      </span>
                    )}
                    {p.badge && (
                      <span className="rounded-full bg-harvest-500/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-harvest-700">
                        {p.badge}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <AdminProductActions id={p.id} name={p.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
