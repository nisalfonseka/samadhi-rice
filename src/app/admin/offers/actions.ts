"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/services/activity.service";
import { OFFER_TONES, OFFER_SIZES } from "@/lib/services/offer.service";

const schema = z.object({
  eyebrow: z.string().trim().min(2, "Eyebrow is required").max(60),
  title: z.string().trim().min(2, "Title is required").max(120),
  detail: z.string().trim().max(280).optional().or(z.literal("")),
  cta: z.string().trim().min(2).max(40).default("Shop now"),
  ctaHref: z.string().trim().min(1).max(300).default("/shop"),
  tone: z.enum(OFFER_TONES).default("gold"),
  size: z.enum(OFFER_SIZES).default("wide"),
  position: z.coerce.number().int().min(0).max(999).default(0),
  enabled: z.coerce.boolean(),
});

function parse(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return schema.safeParse({
    ...raw,
    enabled: formData.get("enabled") === "on" || formData.get("enabled") === "true",
  });
}

function refresh() {
  revalidatePath("/admin/offers");
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function createOffer(formData: FormData) {
  const session = await assertAdmin();
  const parsed = parse(formData);
  if (!parsed.success) return;
  const d = parsed.data;
  const created = await prisma.offer.create({
    data: {
      eyebrow: d.eyebrow,
      title: d.title,
      detail: d.detail || null,
      cta: d.cta,
      ctaHref: d.ctaHref,
      tone: d.tone,
      size: d.size,
      position: d.position,
      enabled: d.enabled,
    },
  });
  await logActivity(session.user, "Created offer", { entity: created.title });
  refresh();
}

export async function updateOffer(id: string, formData: FormData) {
  const session = await assertAdmin();
  const parsed = parse(formData);
  if (!parsed.success) return;
  const d = parsed.data;
  await prisma.offer.update({
    where: { id },
    data: {
      eyebrow: d.eyebrow,
      title: d.title,
      detail: d.detail || null,
      cta: d.cta,
      ctaHref: d.ctaHref,
      tone: d.tone,
      size: d.size,
      position: d.position,
      enabled: d.enabled,
    },
  });
  await logActivity(session.user, "Updated offer", { entity: d.title });
  refresh();
}

export async function toggleOffer(id: string) {
  const session = await assertAdmin();
  const o = await prisma.offer.findUnique({ where: { id } });
  if (!o) return;
  await prisma.offer.update({ where: { id }, data: { enabled: !o.enabled } });
  await logActivity(session.user, o.enabled ? "Disabled offer" : "Enabled offer", {
    entity: o.title,
  });
  refresh();
}

export async function moveOffer(id: string, dir: -1 | 1) {
  const session = await assertAdmin();
  const o = await prisma.offer.findUnique({ where: { id } });
  if (!o) return;
  // find neighbour
  const neighbour = await prisma.offer.findFirst({
    where:
      dir === -1
        ? { position: { lt: o.position } }
        : { position: { gt: o.position } },
    orderBy: { position: dir === -1 ? "desc" : "asc" },
  });
  if (!neighbour) return;
  await prisma.$transaction([
    prisma.offer.update({ where: { id: o.id }, data: { position: neighbour.position } }),
    prisma.offer.update({ where: { id: neighbour.id }, data: { position: o.position } }),
  ]);
  await logActivity(session.user, "Reordered offer", { entity: o.title });
  refresh();
}

export async function deleteOffer(id: string) {
  const session = await assertAdmin();
  const o = await prisma.offer.delete({ where: { id } });
  await logActivity(session.user, "Deleted offer", { entity: o.title });
  refresh();
}
