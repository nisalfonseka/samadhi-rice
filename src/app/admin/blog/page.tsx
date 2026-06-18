import Link from "next/link";
import { getAdminPosts } from "@/lib/services/blog.service";
import { togglePublish, deletePost } from "@/app/admin/blog/actions";
import AsyncButton from "@/components/admin/AsyncButton";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await getAdminPosts();

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-husk">Blog</h1>
          <p className="mt-1 text-husk-soft">
            {posts.length} {posts.length === 1 ? "post" : "posts"} ·{" "}
            {posts.filter((p) => p.published).length} published.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-full bg-paddy-800 px-5 py-2.5 text-sm font-medium text-rice-50 transition-colors hover:bg-paddy-900"
        >
          + New post
        </Link>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-husk/10 bg-rice-50 px-6 py-16 text-center text-husk-soft">
          No posts yet. Write your first story.
        </div>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id} className="rounded-2xl border border-husk/10 bg-rice-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {p.published ? (
                      <span className="rounded-full bg-paddy-600/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-paddy-700">
                        Published
                      </span>
                    ) : (
                      <span className="rounded-full bg-harvest-500/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-harvest-700">
                        Draft
                      </span>
                    )}
                    <Link href={`/admin/blog/${p.id}/edit`} className="font-display text-lg text-husk hover:text-paddy-800">
                      {p.title}
                    </Link>
                  </div>
                  <p className="mt-1 text-xs text-husk-soft">
                    /blog/{p.slug}
                    {p.publishedAt
                      ? ` · published ${new Date(p.publishedAt).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}`
                      : ` · created ${new Date(p.createdAt).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}`}
                  </p>
                  {p.excerpt && <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-husk-soft">{p.excerpt}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {p.published && (
                    <Link
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      className="rounded-lg border border-husk/15 px-3 py-1.5 text-xs font-medium text-husk hover:border-paddy-600"
                    >
                      View ↗
                    </Link>
                  )}
                  <AsyncButton
                    action={togglePublish.bind(null, p.id)}
                    className="rounded-lg border border-husk/15 px-3 py-1.5 text-xs font-medium text-husk hover:border-paddy-600"
                  >
                    {p.published ? "Unpublish" : "Publish"}
                  </AsyncButton>
                  <Link
                    href={`/admin/blog/${p.id}/edit`}
                    className="rounded-lg border border-husk/15 px-3 py-1.5 text-xs font-medium text-husk hover:border-paddy-600"
                  >
                    Edit
                  </Link>
                  <AsyncButton
                    action={deletePost.bind(null, p.id)}
                    confirm={`Delete "${p.title}"? This cannot be undone.`}
                    className="rounded-lg border border-husk/15 px-3 py-1.5 text-xs font-medium text-clay-600 hover:border-clay-500 hover:bg-clay-500 hover:text-rice-50"
                  >
                    Delete
                  </AsyncButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
