import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedPosts, excerptFrom, readingTimeMin } from "@/lib/services/blog.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stories from the paddy field",
  description:
    "Recipes, rice variety guides, cooking tips and stories from family paddy fields across Sri Lanka.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim() || undefined;

  let data: Awaited<ReturnType<typeof getPublishedPosts>>;
  try {
    data = await getPublishedPosts({ page, q });
  } catch {
    data = { posts: [], total: 0, pages: 1, page };
  }
  const { posts, total, pages } = data;

  return (
    <div className="bg-paper min-h-screen">
      <header className="mx-auto max-w-7xl px-5 pb-10 pt-32 sm:px-8 sm:pt-36">
        <nav className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-husk-soft">
          <Link href="/" className="hover:text-paddy-700">Home</Link>
          <span aria-hidden>/</span>
          <span className="text-husk">Stories</span>
        </nav>
        <p className="kicker mb-3 text-clay-500">Recipes & stories</p>
        <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-medium text-husk">
          From the paddy field, with love
        </h1>
        <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-husk-soft">
          Recipes, rice-variety guides, cooking tips and the stories of the
          families who grow and mill the rice you eat.
        </p>

        <form className="mt-8 max-w-md" action="/blog" method="get">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search recipes, varieties, tips…"
            className="ctrl"
          />
        </form>
      </header>

      <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-husk/10 bg-rice-50 px-6 py-20 text-center">
            <p className="font-display text-2xl text-husk">
              {q ? "No stories matched that search" : "Stories are being written"}
            </p>
            <p className="mt-2 text-sm text-husk-soft">
              {q ? "Try another keyword." : "Check back soon for recipes and rice guides."}
            </p>
          </div>
        ) : (
          <>
            {/* lead post (first) on its own */}
            {page === 1 && !q && (
              <Link
                href={`/blog/${posts[0].slug}`}
                className="group mb-12 block overflow-hidden rounded-3xl border border-husk/10 bg-rice-50 transition-all duration-500 hover:-translate-y-0.5 hover:border-clay-400/40 hover:shadow-[0_36px_70px_-34px_rgba(34,31,23,0.55)]"
              >
                <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[radial-gradient(120%_100%_at_20%_20%,var(--color-rice-100),var(--color-rice-200))] md:aspect-auto">
                    {posts[0].coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={posts[0].coverImage}
                        alt={posts[0].title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <PaperPattern />
                    )}
                  </div>
                  <div className="flex flex-col justify-center gap-4 p-8 sm:p-10">
                    <span className="kicker text-clay-500">Latest story</span>
                    <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-medium leading-tight text-husk transition-colors group-hover:text-paddy-800">
                      {posts[0].title}
                    </h2>
                    <p className="text-husk-soft">
                      {posts[0].excerpt || excerptFrom(posts[0].content)}
                    </p>
                    <p className="text-xs uppercase tracking-widest text-husk-soft">
                      {readingTimeMin(posts[0].content)} min read
                      {posts[0].publishedAt
                        ? ` · ${new Date(posts[0].publishedAt).toLocaleDateString("en-LK", { day: "numeric", month: "long", year: "numeric" })}`
                        : ""}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(page === 1 && !q ? posts.slice(1) : posts).map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="group block overflow-hidden rounded-3xl border border-husk/10 bg-rice-50 transition-all duration-500 hover:-translate-y-1 hover:border-clay-400/40 hover:shadow-[0_36px_70px_-34px_rgba(34,31,23,0.55)]"
                >
                  <div className="relative aspect-[5/3] overflow-hidden bg-[radial-gradient(120%_100%_at_50%_0%,var(--color-rice-100),var(--color-rice-200))]">
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.coverImage}
                        alt={p.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <PaperPattern />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl text-husk transition-colors group-hover:text-paddy-800">
                      {p.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-husk-soft">
                      {p.excerpt || excerptFrom(p.content, 140)}
                    </p>
                    <p className="mt-4 text-xs uppercase tracking-widest text-husk-soft">
                      {readingTimeMin(p.content)} min read
                      {p.publishedAt
                        ? ` · ${new Date(p.publishedAt).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}`
                        : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {pages > 1 && (
              <nav className="mt-14 flex items-center justify-center gap-3" aria-label="Pagination">
                {Array.from({ length: pages }).map((_, i) => {
                  const n = i + 1;
                  const isActive = n === page;
                  const href =
                    "/blog?" +
                    new URLSearchParams({ ...(q ? { q } : {}), page: String(n) }).toString();
                  return (
                    <Link
                      key={n}
                      href={n === 1 && !q ? "/blog" : href}
                      className={
                        isActive
                          ? "rounded-full bg-paddy-800 px-4 py-2 text-sm font-medium text-rice-50"
                          : "rounded-full border border-husk/15 px-4 py-2 text-sm font-medium text-husk hover:border-paddy-600"
                      }
                    >
                      {n}
                    </Link>
                  );
                })}
              </nav>
            )}

            <p className="mt-10 text-center text-xs uppercase tracking-widest text-husk-soft">
              {total} {total === 1 ? "story" : "stories"} so far
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function PaperPattern() {
  return (
    <svg viewBox="0 0 400 240" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <pattern id="grains" width="40" height="24" patternUnits="userSpaceOnUse">
          <ellipse cx="10" cy="12" rx="4" ry="1.6" fill="#c79a3b" opacity="0.18" transform="rotate(15 10 12)" />
          <ellipse cx="28" cy="6" rx="4" ry="1.6" fill="#324327" opacity="0.18" transform="rotate(-22 28 6)" />
          <ellipse cx="32" cy="18" rx="4" ry="1.6" fill="#8a5d3b" opacity="0.18" transform="rotate(40 32 18)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grains)" />
    </svg>
  );
}
