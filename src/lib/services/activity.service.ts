import { prisma } from "@/lib/db";

export async function logActivity(
  actor: { id?: string; name?: string | null },
  action: string,
  opts?: { entity?: string; detail?: string },
) {
  try {
    await prisma.activityLog.create({
      data: {
        actorId: actor.id ?? null,
        actorName: actor.name ?? null,
        action,
        entity: opts?.entity ?? null,
        detail: opts?.detail ?? null,
      },
    });
  } catch {
    /* logging must never break the underlying mutation */
  }
}

export async function getRecentActivity(take = 25) {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
  });
}
