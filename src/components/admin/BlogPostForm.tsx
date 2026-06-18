"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { BlogFormState } from "@/app/admin/blog/actions";
import RichEditor from "@/components/admin/RichEditor";
import ImageUploader from "@/components/admin/ImageUploader";
import { cn } from "@/lib/utils";

type Initial = {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  published?: boolean;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function BlogPostForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: BlogFormState, formData: FormData) => Promise<BlogFormState>;
  initial?: Initial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initial?.slug));
  const initialCover = initial?.coverImage ? [initial.coverImage] : undefined;

  return (
    <form action={formAction} className="max-w-4xl space-y-8">
      {state?.error && (
        <p className="rounded-xl bg-clay-500/10 px-4 py-3 text-sm text-clay-700">
          {state.error}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-husk">Title</span>
          <input
            name="title"
            required
            className="ctrl text-lg"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugEdited) setSlug(slugify(e.target.value));
            }}
            placeholder="The right rice for a real biryani"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-husk">Slug</span>
          <input
            name="slug"
            required
            className="ctrl"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
            placeholder="rice-for-biryani"
          />
          <span className="mt-1 block text-xs text-husk-soft">URL: /blog/{slug || "your-slug"}</span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-husk">Published</span>
          <label className="ctrl flex !w-fit cursor-pointer items-center gap-2 !py-2">
            <input type="checkbox" name="published" defaultChecked={initial?.published ?? false} className="h-4 w-4 accent-paddy-800" />
            <span className="text-sm">Visible on /blog</span>
          </label>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-husk">Excerpt</span>
          <textarea
            name="excerpt"
            className="ctrl min-h-20 resize-y"
            defaultValue={initial?.excerpt ?? ""}
            placeholder="One short paragraph that pulls readers in (shown on listings & SEO)."
          />
        </label>
      </section>

      {/* cover image */}
      <section>
        <p className="mb-3 text-sm font-medium text-husk">Cover image</p>
        <ImageUploader name="coverImages" initial={initialCover} />
      </section>

      {/* content */}
      <section>
        <p className="mb-3 text-sm font-medium text-husk">Article</p>
        <RichEditor name="content" initial={initial?.content} />
      </section>

      {/* SEO */}
      <section className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-husk">Meta title (SEO)</span>
          <input name="metaTitle" className="ctrl" defaultValue={initial?.metaTitle ?? ""} placeholder="Defaults to article title" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-husk">Meta description (SEO)</span>
          <input name="metaDescription" className="ctrl" defaultValue={initial?.metaDescription ?? ""} placeholder="Defaults to excerpt" />
        </label>
      </section>

      <div className="flex items-center gap-3 border-t border-husk/10 pt-6">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "rounded-full px-7 py-3 font-medium text-rice-50 transition-colors",
            pending ? "bg-paddy-600" : "bg-paddy-800 hover:bg-paddy-900",
          )}
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href="/admin/blog" className="text-sm font-medium text-husk-soft hover:text-husk">
          Cancel
        </Link>
      </div>
    </form>
  );
}

