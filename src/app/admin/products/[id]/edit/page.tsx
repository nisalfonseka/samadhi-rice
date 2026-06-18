import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { updateProduct } from "@/app/admin/actions";
import { getAdminProduct, getCategoriesSimple } from "@/lib/services/admin.service";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getCategoriesSimple(),
  ]);
  if (!product) notFound();

  const action = updateProduct.bind(null, product.id);

  return (
    <div>
      <nav className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-husk-soft">
        <Link href="/admin/products" className="hover:text-paddy-700">Products</Link>
        <span aria-hidden>/</span>
        <span className="text-husk">{product.name}</span>
      </nav>
      <h1 className="mb-8 font-display text-3xl text-husk">Edit product</h1>
      <ProductForm
        action={action}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initial={product}
        submitLabel="Save changes"
      />
    </div>
  );
}
