import Link from "next/link";
import { getReviews } from "@/lib/services/admin.service";
import { approveReview, deleteReview } from "@/app/admin/actions";
import AsyncButton from "@/components/admin/AsyncButton";
import ReviewReply from "@/components/admin/ReviewReply";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const f = filter === "approved" ? "approved" : filter === "pending" ? "pending" : undefined;
  const reviews = await getReviews(f);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl text-husk">Reviews</h1>
        <p className="mt-1 text-husk-soft">Approve, reply to or remove customer reviews.</p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={t.value ? `/admin/reviews?filter=${t.value}` : "/admin/reviews"}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              (filter ?? "") === t.value
                ? "border-paddy-800 bg-paddy-800 text-rice-50"
                : "border-husk/15 text-husk-soft hover:border-paddy-600 hover:text-husk",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-husk/10 bg-rice-50 px-6 py-16 text-center text-husk-soft">
          No reviews here.
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border border-husk/10 bg-rice-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-harvest-500">
                    {"★★★★★".slice(0, r.rating)}
                    {!r.approved && (
                      <span className="rounded-full bg-harvest-500/15 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-harvest-700">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-husk">{r.comment}</p>
                  <p className="mt-2 text-xs text-husk-soft">
                    {r.authorName}{r.place ? ` · ${r.place}` : ""} · on{" "}
                    <Link href={`/shop/${r.product.slug}`} className="hover:text-paddy-700">
                      {r.product.name}
                    </Link>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!r.approved && (
                    <AsyncButton
                      action={approveReview.bind(null, r.id)}
                      className="rounded-lg border border-paddy-700 px-3 py-1.5 text-xs font-medium text-paddy-700 hover:bg-paddy-700 hover:text-rice-50"
                    >
                      Approve
                    </AsyncButton>
                  )}
                  <AsyncButton
                    action={deleteReview.bind(null, r.id)}
                    confirm="Delete this review permanently?"
                    className="rounded-lg border border-husk/15 px-3 py-1.5 text-xs font-medium text-clay-600 hover:border-clay-500 hover:bg-clay-500 hover:text-rice-50"
                  >
                    Delete
                  </AsyncButton>
                </div>
              </div>
              {r.adminReply && (
                <p className="mt-3 rounded-xl bg-rice-100 px-4 py-2 text-sm text-husk-soft">
                  <span className="font-semibold text-husk">Your reply:</span> {r.adminReply}
                </p>
              )}
              <ReviewReply id={r.id} initial={r.adminReply} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
