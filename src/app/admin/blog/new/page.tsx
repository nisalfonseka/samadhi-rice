import Link from "next/link";
import BlogPostForm from "@/components/admin/BlogPostForm";
import { createPost } from "@/app/admin/blog/actions";

export const dynamic = "force-dynamic";

export default function NewBlogPostPage() {
  return (
    <div>
      <nav className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-husk-soft">
        <Link href="/admin/blog" className="hover:text-paddy-700">Blog</Link>
        <span aria-hidden>/</span>
        <span className="text-husk">New</span>
      </nav>
      <h1 className="mb-8 font-display text-3xl text-husk">New post</h1>
      <BlogPostForm action={createPost} submitLabel="Create post" />
    </div>
  );
}
