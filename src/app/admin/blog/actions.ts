"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/services/activity.service";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const schema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(180),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers and hyphens only"),
  excerpt: z.string().trim().max(280).optional().or(z.literal("")),
  content: z.string().min(10, "Content is too short"),
  coverImage: z.string().url().optional().or(z.literal("")),
  metaTitle: z.string().trim().max(180).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(280).optional().or(z.literal("")),
  published: z.coerce.boolean(),
});

export type BlogFormState = { error?: string } | undefined;

function parse(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  // ImageUploader writes a JSON array — pull the first URL as the cover
  let coverImage = "";
  try {
    const arr = JSON.parse((formData.get("coverImages") as string) || "[]");
    if (Array.isArray(arr) && typeof arr[0] === "string") coverImage = arr[0];
  } catch {
    /* leave empty */
  }
  return schema.safeParse({
    ...raw,
    coverImage,
    published: formData.get("published") === "on" || formData.get("published") === "true",
  });
}

function dataFrom(d: z.infer<typeof schema>, prevPublished = false) {
  const now = new Date();
  return {
    title: d.title,
    slug: d.slug,
    excerpt: d.excerpt || null,
    content: d.content,
    coverImage: d.coverImage || null,
    metaTitle: d.metaTitle || null,
    metaDescription: d.metaDescription || null,
    published: d.published,
    publishedAt: d.published && !prevPublished ? now : undefined,
  };
}

export async function createPost(
  _prev: BlogFormState,
  formData: FormData,
): Promise<BlogFormState> {
  const session = await assertAdmin();
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const desiredSlug = parsed.data.slug || slugify(parsed.data.title);
  const exists = await prisma.blogPost.findUnique({ where: { slug: desiredSlug } });
  if (exists) return { error: `A post with slug "${desiredSlug}" already exists` };

  const data = dataFrom({ ...parsed.data, slug: desiredSlug });
  await prisma.blogPost.create({
    data: {
      ...data,
      publishedAt: data.publishedAt ?? null,
    },
  });
  await logActivity(session.user, "Created blog post", { entity: desiredSlug });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/");
  redirect("/admin/blog");
}

export async function updatePost(
  id: string,
  _prev: BlogFormState,
  formData: FormData,
): Promise<BlogFormState> {
  const session = await assertAdmin();
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return { error: "Post not found" };

  const clash = await prisma.blogPost.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (clash) return { error: `Another post already uses slug "${parsed.data.slug}"` };

  const data = dataFrom(parsed.data, existing.published);
  await prisma.blogPost.update({ where: { id }, data });
  await logActivity(session.user, "Updated blog post", { entity: parsed.data.slug });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${parsed.data.slug}`);
  if (existing.slug !== parsed.data.slug) revalidatePath(`/blog/${existing.slug}`);
  revalidatePath("/");
  redirect("/admin/blog");
}

export async function togglePublish(id: string) {
  const session = await assertAdmin();
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return;
  const willPublish = !post.published;
  await prisma.blogPost.update({
    where: { id },
    data: {
      published: willPublish,
      publishedAt: willPublish && !post.publishedAt ? new Date() : post.publishedAt,
    },
  });
  await logActivity(
    session.user,
    willPublish ? "Published blog post" : "Unpublished blog post",
    { entity: post.slug },
  );
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
}

export async function deletePost(id: string) {
  const session = await assertAdmin();
  const post = await prisma.blogPost.delete({ where: { id } });
  await logActivity(session.user, "Deleted blog post", { entity: post.slug });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
}
