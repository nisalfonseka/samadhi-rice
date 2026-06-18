import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import { getLatestPosts, readingTimeMin, excerptFrom } from "@/lib/services/blog.service";

export default async function BlogPreview() {
  let posts: Awaited<ReturnType<typeof getLatestPosts>> = [];
  try {
    posts = await getLatestPosts(3);
  } catch {
    /* DB might be transiently unavailable — silently hide */
  }
  if (posts.length === 0) return null;

  return (
    <section className="bg-paper relative py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          kicker="Recipes & stories"
          title="From our paddy field journal"
          intro="Rice-variety guides, recipes from Sri Lankan kitchens, and the stories of the families who grow the rice you eat."
          link={{ label: "All stories", href: "/blog" }}
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((p, i) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className={`group block overflow-hidden rounded-3xl border border-husk/10 bg-rice-50 transition-all duration-500 hover:-translate-y-1 hover:border-clay-400/40 hover:shadow-[0_36px_70px_-34px_rgba(34,31,23,0.55)] ${
                i === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <div
                className={`relative overflow-hidden bg-[radial-gradient(120%_100%_at_50%_0%,var(--color-rice-100),var(--color-rice-200))] ${
                  i === 0 ? "aspect-[16/9]" : "aspect-[5/3]"
                }`}
              >
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
              <div className={i === 0 ? "p-8" : "p-6"}>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-clay-500">
                  {readingTimeMin(p.content)} min read
                  {p.publishedAt
                    ? ` · ${new Date(p.publishedAt).toLocaleDateString("en-LK", { day: "numeric", month: "short" })}`
                    : ""}
                </p>
                <h3
                  className={`mt-2 font-display ${i === 0 ? "text-3xl" : "text-xl"} text-husk transition-colors group-hover:text-paddy-800`}
                >
                  {p.title}
                </h3>
                <p className={`mt-3 ${i === 0 ? "text-base" : "text-sm"} leading-relaxed text-husk-soft line-clamp-3`}>
                  {p.excerpt || excerptFrom(p.content, i === 0 ? 220 : 140)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function PaperPattern() {
  return (
    <svg viewBox="0 0 400 240" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <pattern id="grains-bp" width="40" height="24" patternUnits="userSpaceOnUse">
          <ellipse cx="10" cy="12" rx="4" ry="1.6" fill="#c79a3b" opacity="0.18" transform="rotate(15 10 12)" />
          <ellipse cx="28" cy="6" rx="4" ry="1.6" fill="#324327" opacity="0.18" transform="rotate(-22 28 6)" />
          <ellipse cx="32" cy="18" rx="4" ry="1.6" fill="#8a5d3b" opacity="0.18" transform="rotate(40 32 18)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grains-bp)" />
    </svg>
  );
}
