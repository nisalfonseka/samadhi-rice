import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, getRelatedPosts, readingTimeMin, excerptFrom } from "@/lib/services/blog.service";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post || !post.published) return { title: "Not found" };
  const description = post.metaDescription ?? post.excerpt ?? excerptFrom(post.content);
  return {
    title: post.metaTitle ?? post.title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: description ?? undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title: post.title,
      description: description ?? undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

const SITE = "https://samadhirice.lk";

function ShareLinks({ url, title }: { url: string; title: string }) {
  const enc = encodeURIComponent;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-widest text-husk-soft">Share</span>
      <a
        href={`https://api.whatsapp.com/send?text=${enc(`${title} — ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="grid h-8 w-8 place-items-center rounded-full border border-husk/15 text-husk transition-colors hover:border-paddy-600 hover:text-paddy-700"
        aria-label="Share on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3m0 1.8a7.2 7.2 0 1 1 0 14.4 7 7 0 0 1-3.7-1l-2.6.7.7-2.5-.3-.5A7.2 7.2 0 0 1 12 4.8m4.1 9c-.2-.1-1.3-.7-1.5-.7s-.4-.1-.5.1-.6.7-.7.9-.3.2-.5.1a5.9 5.9 0 0 1-1.7-1 6.5 6.5 0 0 1-1.2-1.5c-.1-.2 0-.4.1-.5l.4-.4q.15-.3 0-.5l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11 11 0 0 0 4.2 3.7c2 .8 2 .5 2.4.5a2.5 2.5 0 0 0 1.7-1.2 2 2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3" />
        </svg>
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="grid h-8 w-8 place-items-center rounded-full border border-husk/15 text-husk transition-colors hover:border-paddy-600 hover:text-paddy-700"
        aria-label="Share on Facebook"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.6V4q-.9-.1-2.1-.1c-2.4 0-4 1.4-4 4v2H8v3h2.6v8z" />
        </svg>
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="grid h-8 w-8 place-items-center rounded-full border border-husk/15 text-husk transition-colors hover:border-paddy-600 hover:text-paddy-700"
        aria-label="Share on X"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M18.244 2H21l-6.56 7.5L22 22h-6.788l-4.733-6.187L4.8 22H2l7.027-8.03L2 2h6.913l4.28 5.66Zm-1.187 18h1.512L7.04 3.94H5.41Z" />
        </svg>
      </a>
    </div>
  );
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post || !post.published) notFound();

  const related = await getRelatedPosts(post.slug, 3).catch(() => []);
  const reading = readingTimeMin(post.content);
  const url = `${SITE}/blog/${post.slug}`;
  const description = post.metaDescription ?? post.excerpt ?? excerptFrom(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: "SamadhiRice.lk" },
    publisher: { "@type": "Organization", name: "SamadhiRice.lk" },
  };

  return (
    <div className="bg-paper min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* hero */}
      <header className="relative overflow-hidden">
        <div className="mx-auto max-w-3xl px-5 pb-12 pt-32 sm:px-8 sm:pt-40">
          <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest text-husk-soft">
            <Link href="/" className="hover:text-paddy-700">Home</Link>
            <span aria-hidden>/</span>
            <Link href="/blog" className="hover:text-paddy-700">Stories</Link>
            <span aria-hidden>/</span>
            <span className="text-husk line-clamp-1">{post.title}</span>
          </nav>

          <p className="kicker mb-4 text-clay-500">SamadhiRice Stories</p>
          <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-medium leading-tight text-husk">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-5 max-w-2xl text-[1.1rem] leading-relaxed text-husk-soft">
              {post.excerpt}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-husk/10 py-4 text-xs uppercase tracking-widest text-husk-soft">
            <span>
              {reading} min read
              {post.publishedAt
                ? ` · ${new Date(post.publishedAt).toLocaleDateString("en-LK", { day: "numeric", month: "long", year: "numeric" })}`
                : ""}
            </span>
            <ShareLinks url={url} title={post.title} />
          </div>
        </div>

        {post.coverImage && (
          <div className="mx-auto max-w-5xl px-5 pb-6 sm:px-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="aspect-[16/9] w-full rounded-3xl object-cover"
            />
          </div>
        )}
      </header>

      {/* body */}
      <article className="mx-auto max-w-3xl px-5 pb-20 sm:px-8">
        <div
          className="blog-prose"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-14 flex items-center justify-between border-t border-husk/10 pt-8">
          <Link
            href="/blog"
            className="text-sm font-semibold uppercase tracking-widest text-paddy-700 transition-colors hover:text-paddy-900"
          >
            ← All stories
          </Link>
          <ShareLinks url={url} title={post.title} />
        </div>
      </article>

      {/* related */}
      {related.length > 0 && (
        <section className="bg-rice-100 px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-2xl text-husk">Keep reading</h2>
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group block overflow-hidden rounded-3xl border border-husk/10 bg-rice-50 transition-all duration-500 hover:-translate-y-1 hover:border-clay-400/40 hover:shadow-[0_36px_70px_-34px_rgba(34,31,23,0.55)]"
                >
                  <div className="relative aspect-[5/3] overflow-hidden bg-[radial-gradient(120%_100%_at_50%_0%,var(--color-rice-100),var(--color-rice-200))]">
                    {r.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.coverImage}
                        alt={r.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg text-husk transition-colors group-hover:text-paddy-800">
                      {r.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-husk-soft">
                      {r.excerpt || excerptFrom(r.content, 120)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
