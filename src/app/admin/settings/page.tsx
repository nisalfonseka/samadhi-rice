import { getSettings } from "@/lib/services/settings.service";
import { saveShopSettings } from "@/app/admin/actions";
import FreeDeliverySection from "@/components/admin/FreeDeliverySection";
import BranchManager from "@/components/admin/BranchManager";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function Section({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-husk/10 bg-rice-50 p-6">
      <div className="mb-5 border-b border-husk/8 pb-4">
        <h2 className="font-display text-xl text-husk">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-husk-soft">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, children }: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-husk">{label}</span>
      {hint && <span className="mb-1.5 block text-xs text-husk-soft">{hint}</span>}
      {children}
    </label>
  );
}

export default async function AdminSettingsPage() {
  const [s, branches] = await Promise.all([
    getSettings(),
    prisma.branch.findMany({ orderBy: { position: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <header className="mb-8">
        <h1 className="font-display text-3xl text-husk">Settings</h1>
        <p className="mt-1 text-husk-soft">
          Control every aspect of the storefront — delivery, contact, social, and more.
        </p>
      </header>

      <form action={saveShopSettings} className="space-y-7">

        {/* ── Delivery ── */}
        <Section title="Delivery" description="Applied to every new order automatically.">
          <Field label="Flat delivery fee (LKR)">
            <input name="delivery_fee_flat" type="number" min={0} defaultValue={s.deliveryFeeFlat} className="ctrl" />
          </Field>
          <div className="mt-4">
            <FreeDeliverySection
              defaultEnabled={s.freeDeliveryEnabled}
              defaultThreshold={s.freeDeliveryThreshold}
            />
          </div>
          <div className="mt-4">
            <Field label="Delivery zones" hint="One zone per line — shown on the delivery info page.">
              <textarea
                name="delivery_zones"
                rows={4}
                defaultValue={s.deliveryZones}
                className="ctrl resize-none"
                placeholder={"Colombo\nGampaha\nKalutara\nKandy"}
              />
            </Field>
          </div>
        </Section>

        {/* ── Payment ── */}
        <Section title="Payment methods">
          <div className="space-y-3">
            <label className="flex items-center gap-2.5 text-sm text-husk">
              <input type="checkbox" name="cod_enabled" defaultChecked={s.codEnabled} className="h-4 w-4 accent-paddy-800" />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-2.5 text-sm text-husk">
              <input type="checkbox" name="payhere_enabled" defaultChecked={s.payhereEnabled} className="h-4 w-4 accent-paddy-800" />
              PayHere (card / online) — requires merchant keys in <code className="mx-1 rounded bg-husk/8 px-1 py-px text-xs">.env.local</code>
            </label>
          </div>
        </Section>

        {/* ── Contact ── */}
        <Section title="Contact details" description="Shown in the footer and contact page.">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone number">
                <input name="contact_phone" type="tel" defaultValue={s.contactPhone} className="ctrl" placeholder="+94 77 000 0000" />
              </Field>
              <Field label="WhatsApp number" hint="Digits only, with country code (no +).">
                <input name="contact_whatsapp" type="tel" defaultValue={s.contactWhatsapp} className="ctrl" placeholder="94770000000" />
              </Field>
            </div>
            <Field label="Email address">
              <input name="contact_email" type="email" defaultValue={s.contactEmail} className="ctrl" placeholder="hello@samadhirice.lk" />
            </Field>
          </div>
        </Section>

        {/* ── Social media ── */}
        <Section title="Social media" description="Leave blank to hide an icon in the footer.">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Facebook page URL">
                <input name="social_facebook" type="url" defaultValue={s.socialFacebook} className="ctrl" placeholder="https://facebook.com/samadhirice" />
              </Field>
              <Field label="Instagram profile URL">
                <input name="social_instagram" type="url" defaultValue={s.socialInstagram} className="ctrl" placeholder="https://instagram.com/samadhirice" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="YouTube channel URL">
                <input name="social_youtube" type="url" defaultValue={s.socialYoutube} className="ctrl" placeholder="https://youtube.com/@samadhirice" />
              </Field>
              <Field label="TikTok profile URL">
                <input name="social_tiktok" type="url" defaultValue={s.socialTiktok} className="ctrl" placeholder="https://tiktok.com/@samadhirice" />
              </Field>
            </div>
          </div>
        </Section>

        {/* ── Storefront copy ── */}
        <Section title="Storefront copy" description="Text that appears on the homepage and in browser tabs.">
          <div className="space-y-4">
            <Field label="Hero headline" hint="Shown as the large text in the hero section.">
              <input name="hero_headline" defaultValue={s.heroHeadline} className="ctrl" />
            </Field>
            <Field label="Site tagline" hint="Short brand line used in the footer and meta tags.">
              <input name="site_tagline" defaultValue={s.siteTagline} className="ctrl" placeholder="Single-origin Sri Lankan rice, milled fresh." />
            </Field>
            <Field label="Meta description" hint="Overrides the default SEO description (max 160 chars). Leave blank to use the built-in default.">
              <textarea
                name="meta_description"
                rows={3}
                defaultValue={s.metaDescription}
                maxLength={160}
                className="ctrl resize-none"
                placeholder="Heritage Sri Lankan rice milled to order and delivered island-wide."
              />
            </Field>
          </div>
        </Section>

        <div className="flex items-center gap-4 pt-1">
          <button
            type="submit"
            className="rounded-full bg-paddy-800 px-8 py-3 font-medium text-rice-50 transition-colors hover:bg-paddy-700"
          >
            Save all settings
          </button>
          <p className="text-xs text-husk-soft">Changes apply immediately across the storefront.</p>
        </div>
      </form>

      {/* ── Branches — outside the form, has own server actions ── */}
      <div className="mt-7 rounded-2xl border border-husk/10 bg-rice-50 p-6">
        <div className="mb-5 border-b border-husk/8 pb-4">
          <h2 className="font-display text-xl text-husk">Branches &amp; Locations</h2>
          <p className="mt-0.5 text-sm text-husk-soft">
            Each branch is shown as a separate contact block in the footer.
          </p>
        </div>
        <BranchManager branches={branches} />
      </div>
    </div>
  );
}
