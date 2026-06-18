import Link from "next/link";
import { notFound } from "next/navigation";
import BlogPostForm from "@/components/admin/BlogPostForm";
import { updatePost } from "@/app/admin/blog/actions";
import { getAdminPost } from "@/lib/services/blog.service";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getAdminPost(id);
  if (!post) notFound();

  const action = updatePost.bind(null, post.id);

  return (
    <div>
      <nav className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-husk-soft">
        <Link href="/admin/blog" className="hover:text-paddy-700">Blog</Link>
        <span aria-hidden>/</span>
        <span className="text-husk">{post.title}</span>
      </nav>
      <h1 className="mb-8 font-display text-3xl text-husk">Edit post</h1>
      <BlogPostForm action={action} initial={post} submitLabel="Save changes" />
    </div>
  );
}
