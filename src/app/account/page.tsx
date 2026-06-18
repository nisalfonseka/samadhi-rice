import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatLKR } from "@/lib/pricing";
import SignOutButton from "@/components/auth/SignOutButton";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false },
};

const STATUS_TONE: Record<string, string> = {
  PENDING: "bg-harvest-500/15 text-harvest-700",
  CONFIRMED: "bg-mist-400/20 text-paddy-700",
  PROCESSING: "bg-mist-400/20 text-paddy-700",
  SHIPPED: "bg-paddy-500/15 text-paddy-700",
  DELIVERED: "bg-paddy-600/15 text-paddy-700",
  CANCELLED: "bg-clay-500/15 text-clay-700",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const email = session.user.email ?? "";
  const orders = await prisma.order
    .findMany({
      where: { OR: [{ userId: session.user.id }, { email }] },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    })
    .catch(() => []);

  return (
    <div className="bg-paper min-h-screen">
      <div className="mx-auto max-w-4xl px-5 pb-24 pt-32 sm:px-8 sm:pt-36">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="kicker mb-2 text-clay-500">Your account</p>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-medium text-husk">
              {session.user.name ? `Ayubowan, ${session.user.name.split(" ")[0]}` : "Ayubowan"}
            </h1>
            <p className="mt-2 text-husk-soft">{email}</p>
          </div>
          <div className="flex items-center gap-3">
            {session.user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="rounded-full bg-paddy-800 px-5 py-2.5 text-sm font-medium text-rice-50 transition-colors hover:bg-paddy-900"
              >
                Admin dashboard
              </Link>
            )}
            <SignOutButton />
          </div>
        </div>

        {/* orders */}
        <section className="mt-12">
          <h2 className="font-display text-2xl text-husk">Order history</h2>

          {orders.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-husk/10 bg-rice-50 px-6 py-16 text-center">
              <p className="font-display text-xl text-husk">No orders yet</p>
              <p className="mt-2 text-sm text-husk-soft">
                When you place an order it will appear here.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-block rounded-full bg-paddy-800 px-6 py-3 text-sm font-medium text-rice-50 transition-colors hover:bg-paddy-900"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="rounded-3xl border border-husk/10 bg-rice-50 p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Link
                        href={`/order/${o.orderNo}`}
                        className="font-display text-lg text-husk hover:text-paddy-800"
                      >
                        {o.orderNo}
                      </Link>
                      <p className="text-sm text-husk-soft">
                        {new Date(o.createdAt).toLocaleDateString("en-LK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · {o.items.length} {o.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold capitalize",
                          STATUS_TONE[o.status] ?? "bg-husk/10 text-husk",
                        )}
                      >
                        {o.status.toLowerCase()}
                      </span>
                      <span className="font-display text-lg text-husk">
                        {formatLKR(o.total)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-1 text-sm text-husk-soft">
                    {o.items.map((it) => `${it.name} (${it.weightKg}kg ×${it.quantity})`).join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
