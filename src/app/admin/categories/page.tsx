import { getCategoriesWithProductCounts } from "@/lib/services/admin.service";
import { createCategory, updateCategory, deleteCategory } from "@/app/admin/actions";
import AsyncButton from "@/components/admin/AsyncButton";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesWithProductCounts();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-husk">Categories</h1>
        <p className="mt-1 text-husk-soft">Organise the catalogue.</p>
      </header>

      {/* new category */}
      <form
        action={createCategory}
        className="mb-8 grid gap-3 rounded-2xl border border-husk/10 bg-rice-50 p-5 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-end"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-husk">Name</span>
          <input name="name" required className="ctrl" placeholder="Red Rice" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-husk">Slug (optional)</span>
          <input name="slug" className="ctrl" placeholder="red-rice" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-husk">Description</span>
          <input name="description" className="ctrl" placeholder="Short description" />
        </label>
        <button className="rounded-full bg-paddy-800 px-5 py-3 text-sm font-medium text-rice-50 hover:bg-paddy-900">
          Add
        </button>
      </form>

      <ul className="space-y-3">
        {categories.map((c) => (
          <li key={c.id} className="rounded-2xl border border-husk/10 bg-rice-50 p-5">
            <form
              action={updateCategory}
              className="grid gap-3 sm:grid-cols-[1fr_2fr_auto_auto] sm:items-end"
            >
              <input type="hidden" name="id" value={c.id} />
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-husk-soft">
                  {c._count.products} products · /{c.slug}
                </span>
                <input name="name" defaultValue={c.name} required className="ctrl" />
              </label>
              <label className="block">
                <input
                  name="description"
                  defaultValue={c.description ?? ""}
                  className="ctrl"
                  placeholder="Description"
                />
              </label>
              <button className="rounded-full border border-husk/15 px-4 py-3 text-sm font-medium text-husk hover:border-paddy-600">
                Save
              </button>
              <AsyncButton
                action={deleteCategory.bind(null, c.id)}
                confirm={`Delete "${c.name}"? Products in it become uncategorised.`}
                className="rounded-full border border-husk/15 px-4 py-3 text-sm font-medium text-clay-600 hover:border-clay-500 hover:bg-clay-500 hover:text-rice-50"
              >
                Delete
              </AsyncButton>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
