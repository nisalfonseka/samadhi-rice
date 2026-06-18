import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "@/app/admin/actions";
import { getCategoriesSimple } from "@/lib/services/admin.service";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategoriesSimple();

  return (
    <div>
      <nav className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-husk-soft">
        <Link href="/admin/products" className="hover:text-paddy-700">Products</Link>
        <span aria-hidden>/</span>
        <span className="text-husk">New</span>
      </nav>
      <h1 className="mb-8 font-display text-3xl text-husk">New product</h1>
      <ProductForm
        action={createProduct}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        submitLabel="Create product"
      />
    </div>
  );
}
