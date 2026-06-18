import { getSettings } from "@/lib/services/settings.service";
import { saveShopSettings } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const s = await getSettings();

  return (
    <div className="max-w-2xl">
      <header className="mb-8">
        <h1 className="font-display text-3xl text-husk">Settings</h1>
        <p className="mt-1 text-husk-soft">
          Delivery pricing here is applied to every new order automatically.
        </p>
      </header>

      <form action={saveShopSettings} className="space-y-8">
        <section className="rounded-2xl border border-husk/10 bg-rice-50 p-6">
          <h2 className="mb-4 font-display text-xl text-husk">Delivery</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-husk">Flat delivery fee (LKR)</span>
              <input name="delivery_fee_flat" type="number" min={0} defaultValue={s.deliveryFeeFlat} className="ctrl" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-husk">Free delivery over (LKR)</span>
              <input name="free_delivery_threshold" type="number" min={0} defaultValue={s.freeDeliveryThreshold} className="ctrl" />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-husk/10 bg-rice-50 p-6">
          <h2 className="mb-4 font-display text-xl text-husk">Payment methods</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2.5 text-sm text-husk">
              <input type="checkbox" name="cod_enabled" defaultChecked={s.codEnabled} className="h-4 w-4 accent-paddy-800" />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-2.5 text-sm text-husk">
              <input type="checkbox" name="payhere_enabled" defaultChecked={s.payhereEnabled} className="h-4 w-4 accent-paddy-800" />
              PayHere (card / online) — requires keys
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-husk/10 bg-rice-50 p-6">
          <h2 className="mb-4 font-display text-xl text-husk">Storefront</h2>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-husk">Hero headline</span>
            <input name="hero_headline" defaultValue={s.heroHeadline} className="ctrl" />
          </label>
        </section>

        <button className="rounded-full bg-paddy-800 px-7 py-3 font-medium text-rice-50 hover:bg-paddy-900">
          Save settings
        </button>
      </form>
    </div>
  );
}
