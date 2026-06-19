import { getAllOffers, OFFER_TONES, OFFER_SIZES } from "@/lib/services/offer.service";
import {
  createOffer,
  updateOffer,
  toggleOffer,
  deleteOffer,
  moveOffer,
} from "@/app/admin/offers/actions";
import AsyncButton from "@/components/admin/AsyncButton";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TONE_BG: Record<string, string> = {
  gold: "bg-harvest-500/30 text-harvest-700",
  paddy: "bg-paddy-700/15 text-paddy-700",
  clay: "bg-clay-500/15 text-clay-700",
};

export default async function AdminOffersPage() {
  const offers = await getAllOffers();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-husk">Offers</h1>
        <p className="mt-1 text-husk-soft">
          The cards on the homepage Offers section. Drag-equivalent reordering with arrows.
        </p>
      </header>

      {/* create */}
      <form
        action={createOffer}
        className="mb-10 rounded-2xl border border-husk/10 bg-rice-50 p-5"
      >
        <p className="mb-4 font-display text-lg text-husk">New offer</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-husk-soft">Eyebrow</span>
            <input name="eyebrow" required maxLength={60} className="ctrl" placeholder="Pantry stock-up" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-husk-soft">Title</span>
            <input name="title" required maxLength={120} className="ctrl" placeholder="Save 12% on every 25kg bag" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-husk-soft">Detail (optional)</span>
            <input name="detail" maxLength={280} className="ctrl" placeholder="Buy the way Sri Lankan kitchens always have." />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-husk-soft">CTA label</span>
            <input name="cta" defaultValue="Shop now" className="ctrl" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-husk-soft">CTA link</span>
            <input name="ctaHref" defaultValue="/shop" className="ctrl" placeholder="/shop or https://…" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-husk-soft">Tone</span>
            <select name="tone" defaultValue="gold" className="ctrl">
              {OFFER_TONES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-husk-soft">Size</span>
            <select name="size" defaultValue="wide" className="ctrl">
              {OFFER_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <input type="hidden" name="position" value={offers.length} />
          <label className="flex items-center gap-2 text-sm text-husk sm:col-span-2">
            <input type="checkbox" name="enabled" defaultChecked className="h-4 w-4 accent-paddy-800" />
            Show on homepage
          </label>
        </div>
        <div className="mt-4">
          <button className="rounded-full bg-paddy-800 px-6 py-2.5 text-sm font-medium text-rice-50 hover:bg-paddy-900">
            Add offer
          </button>
        </div>
      </form>

      {/* list */}
      {offers.length === 0 ? (
        <div className="rounded-2xl border border-husk/10 bg-rice-50 px-6 py-16 text-center text-husk-soft">
          No offers yet — add one above.
        </div>
      ) : (
        <ul className="space-y-4">
          {offers.map((o, idx) => (
            <li key={o.id} className="rounded-2xl border border-husk/10 bg-rice-50 p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider", TONE_BG[o.tone] ?? "bg-husk/5 text-husk-soft")}>
                    {o.tone}
                  </span>
                  <span className="rounded-full bg-husk/5 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-husk-soft">
                    {o.size}
                  </span>
                  {!o.enabled && (
                    <span className="rounded-full bg-clay-500/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-clay-700">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <AsyncButton
                    action={moveOffer.bind(null, o.id, -1 as const)}
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-lg border border-husk/15 text-husk hover:border-paddy-600",
                      idx === 0 && "pointer-events-none opacity-40",
                    )}
                  >
                    ↑
                  </AsyncButton>
                  <AsyncButton
                    action={moveOffer.bind(null, o.id, 1 as const)}
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-lg border border-husk/15 text-husk hover:border-paddy-600",
                      idx === offers.length - 1 && "pointer-events-none opacity-40",
                    )}
                  >
                    ↓
                  </AsyncButton>
                  <AsyncButton
                    action={toggleOffer.bind(null, o.id)}
                    className="rounded-lg border border-husk/15 px-3 py-1.5 text-xs font-medium text-husk hover:border-paddy-600"
                  >
                    {o.enabled ? "Disable" : "Enable"}
                  </AsyncButton>
                  <AsyncButton
                    action={deleteOffer.bind(null, o.id)}
                    confirm={`Delete "${o.title}"?`}
                    className="rounded-lg border border-husk/15 px-3 py-1.5 text-xs font-medium text-clay-600 hover:border-clay-500 hover:bg-clay-500 hover:text-rice-50"
                  >
                    Delete
                  </AsyncButton>
                </div>
              </div>

              <form action={updateOffer.bind(null, o.id)} className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-husk-soft">Eyebrow</span>
                  <input name="eyebrow" defaultValue={o.eyebrow} required maxLength={60} className="ctrl" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-husk-soft">Title</span>
                  <input name="title" defaultValue={o.title} required maxLength={120} className="ctrl" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-medium text-husk-soft">Detail</span>
                  <input name="detail" defaultValue={o.detail ?? ""} maxLength={280} className="ctrl" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-husk-soft">CTA label</span>
                  <input name="cta" defaultValue={o.cta} className="ctrl" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-husk-soft">CTA link</span>
                  <input name="ctaHref" defaultValue={o.ctaHref} className="ctrl" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-husk-soft">Tone</span>
                  <select name="tone" defaultValue={o.tone} className="ctrl">
                    {OFFER_TONES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-husk-soft">Size</span>
                  <select name="size" defaultValue={o.size} className="ctrl">
                    {OFFER_SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <input type="hidden" name="position" value={o.position} />
                <label className="flex items-center gap-2 text-sm text-husk sm:col-span-2">
                  <input type="checkbox" name="enabled" defaultChecked={o.enabled} className="h-4 w-4 accent-paddy-800" />
                  Show on homepage
                </label>
                <div className="sm:col-span-2">
                  <button className="rounded-full border border-husk/15 px-5 py-2 text-sm font-medium text-husk hover:border-paddy-600">
                    Save
                  </button>
                </div>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
