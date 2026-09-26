import Link from "next/link";
import {
  getSmsAccount,
  getSmsLogs,
  getSmsSettings,
  getSmsStats,
} from "@/lib/services/sms.service";
import { SMS_EVENT_META, SMS_ORDER_EVENTS, type SmsEvent } from "@/lib/sms";
import SmsEventCard from "@/components/admin/sms/SmsEventCard";
import { SmsGatewayForm, SmsMasterSwitch, SmsRetryButton, SmsTestForm } from "@/components/admin/sms/SmsControls";
import { StatusChip } from "@/components/admin/sms/SmsBits";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const LOG_FILTERS = [
  { key: "", label: "All" },
  { key: "SENT", label: "Sent" },
  { key: "FAILED", label: "Failed" },
  { key: "SKIPPED", label: "Skipped" },
];

const EVENT_LABEL: Record<string, string> = {
  ...Object.fromEntries(Object.entries(SMS_EVENT_META).map(([k, v]) => [k, v.label])),
  ADMIN_NEW_ORDER: "Shop alert",
  TEST: "Test",
  MANUAL: "Manual",
};

const TZ = "Asia/Colombo";

const prettyPhone = (p: string) => (/^94\d{9}$/.test(p) ? `0${p.slice(2, 4)} ${p.slice(4, 7)} ${p.slice(7)}` : p);

function Stat({ label, value, hint, href, tone }: { label: string; value: string; hint?: string; href?: string; tone?: "warn" }) {
  const body = (
    <>
      <p className="text-xs font-medium uppercase tracking-widest text-husk-soft">{label}</p>
      <p className={cn("mt-2 font-display text-3xl tabular-nums", tone === "warn" ? "text-clay-600" : "text-husk")}>{value}</p>
      {hint && <p className="mt-1 text-xs text-husk-soft">{hint}</p>}
    </>
  );
  const cls = "rounded-2xl border border-husk/10 bg-rice-50 p-5";
  return href ? (
    <Link href={href} className={cn(cls, "transition-colors hover:border-clay-400")}>{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function Panel({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-husk/10 bg-rice-50 p-5 sm:p-6", className)}>
      <h2 className="font-display text-xl text-husk">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-husk-soft">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function AdminSmsPage({
  searchParams,
}: {
  searchParams: Promise<{ log?: string }>;
}) {
  const { log } = await searchParams;
  const logFilter = LOG_FILTERS.some((f) => f.key === log) ? log! : "";

  const [settings, account, stats, logs] = await Promise.all([
    getSmsSettings(),
    getSmsAccount(),
    getSmsStats(),
    getSmsLogs({ status: logFilter || undefined, take: 60 }),
  ]);

  const expiry =
    account.connected && account.expiresAt
      ? new Date(account.expiresAt).toLocaleDateString("en-LK", { day: "numeric", month: "long", year: "numeric", timeZone: TZ })
      : null;
  const lowBalance = account.connected && account.balance != null && account.balance < 50;

  const card = (event: SmsEvent, step: number | null, last?: boolean) => (
    <SmsEventCard
      key={event}
      event={event}
      step={step}
      last={last}
      enabled={settings.events[event].enabled}
      template={settings.events[event].template}
      isDefault={settings.events[event].isDefault}
      senderId={settings.senderId}
      masterOn={settings.enabled}
      disabledReason={
        event === "ADMIN_NEW_ORDER" && !settings.adminPhone
          ? "Add the shop mobile in Gateway settings to receive these."
          : undefined
      }
    />
  );

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-husk">SMS notifications</h1>
        <p className="mt-1 max-w-2xl text-husk-soft">
          Keep customers in the loop from mill to doorstep. Choose which order updates send a text, and
          shape every message in your own words.
        </p>
      </header>

      {/* ── gateway card ── */}
      <section className="relative overflow-hidden rounded-3xl bg-paddy-900 p-6 text-rice-50 sm:p-8">
        {/* rice-grain texture */}
        <svg aria-hidden viewBox="0 0 220 160" className="pointer-events-none absolute -right-6 -top-6 h-48 w-64 text-harvest-400/15">
          {Array.from({ length: 18 }).map((_, i) => (
            <ellipse
              key={i}
              cx={20 + (i % 6) * 36 + (Math.floor(i / 6) % 2) * 18}
              cy={24 + Math.floor(i / 6) * 48}
              rx="6"
              ry="15"
              transform={`rotate(${(i * 37) % 70 - 35} ${20 + (i % 6) * 36 + (Math.floor(i / 6) % 2) * 18} ${24 + Math.floor(i / 6) * 48})`}
              fill="currentColor"
            />
          ))}
        </svg>

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-harvest-300">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  account.connected
                    ? settings.enabled ? "animate-pulse bg-paddy-300" : "bg-harvest-400"
                    : account.transient ? "bg-harvest-400" : "bg-clay-400",
                )}
              />
              text.lk gateway ·{" "}
              {account.connected ? "connected" : account.transient ? "not responding" : "not connected"}
            </p>

            {account.connected ? (
              <div className="mt-5 flex flex-wrap items-end gap-x-10 gap-y-5">
                <div>
                  <p className="font-display text-5xl leading-none tabular-nums">{account.balance ?? "—"}</p>
                  <p className={cn("mt-2 text-sm", lowBalance ? "text-harvest-300" : "text-rice-50/65")}>
                    SMS credits left{lowBalance ? " · running low" : ""}
                  </p>
                </div>
                <div className="space-y-1.5 text-sm">
                  <p className="text-rice-50/65">
                    Sending as{" "}
                    <span className="rounded-md bg-rice-50/10 px-2 py-0.5 font-semibold text-rice-50">{settings.senderId}</span>
                  </p>
                  {account.name && <p className="text-rice-50/65">Account · <span className="text-rice-50">{account.name}</span></p>}
                  {expiry && (
                    <p className={account.expired ? "font-medium text-harvest-300" : "text-rice-50/65"}>
                      {account.expired ? `Plan expired ${expiry} — renew on text.lk` : `Plan valid until ${expiry}`}
                    </p>
                  )}
                </div>
              </div>
            ) : account.transient ? (
              <div className="mt-5 max-w-lg">
                <p className="font-display text-2xl">Couldn’t fetch your balance</p>
                <p className="mt-2 text-sm text-rice-50/70">
                  {account.error}. Sending still works — this only affects the balance shown here.
                </p>
              </div>
            ) : (
              <div className="mt-5 max-w-lg">
                <p className="font-display text-2xl">SMS can’t be sent yet</p>
                <p className="mt-2 text-sm text-rice-50/70">
                  {account.error}. Add <code className="rounded bg-rice-50/10 px-1.5 py-px text-xs">TEXTLK_API_TOKEN</code> to{" "}
                  <code className="rounded bg-rice-50/10 px-1.5 py-px text-xs">.env.local</code> (and your Vercel project) and
                  restart. Messages are still logged below as “skipped”.
                </p>
              </div>
            )}
          </div>

          <SmsMasterSwitch enabled={settings.enabled} />
        </div>
      </section>

      {/* ── stats ── */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Sent today" value={String(stats.today)} />
        <Stat
          label="This month"
          value={String(stats.month)}
          hint={`${stats.monthSegments} credit${stats.monthSegments === 1 ? "" : "s"} used`}
        />
        <Stat
          label="Delivery rate"
          value={stats.deliveryRate == null ? "—" : `${stats.deliveryRate}%`}
          hint="last 30 days"
        />
        <Stat
          label="Needs attention"
          value={String(stats.failed30)}
          hint="failed or skipped · 30 days"
          href={stats.failed30 ? "/admin/sms?log=FAILED#log" : undefined}
          tone={stats.failed30 ? "warn" : undefined}
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* ── journey ── */}
        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl text-husk">Order journey</h2>
              <p className="mt-0.5 text-sm text-husk-soft">
                Each step texts the customer when an order reaches it. Switch off any you don’t need.
              </p>
            </div>
          </div>

          {!settings.enabled && (
            <p className="mb-5 rounded-2xl border border-harvest-500/40 bg-harvest-200/40 px-4 py-3 text-sm text-husk">
              <strong className="font-semibold">All SMS are paused.</strong> Your choices below are kept — nothing
              goes out until you switch notifications back on.
            </p>
          )}

          <ol className="space-y-5">
            {SMS_ORDER_EVENTS.map((e, i) => card(e, i + 1, i === SMS_ORDER_EVENTS.length - 1))}
          </ol>

          <h2 className="mb-1 mt-12 font-display text-2xl text-husk">For the shop</h2>
          <p className="mb-5 text-sm text-husk-soft">A heads-up on your own phone the moment an order lands.</p>
          <ol>{card("ADMIN_NEW_ORDER", null, true)}</ol>
        </div>

        {/* ── side panels ── */}
        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <Panel title="Gateway settings">
            <SmsGatewayForm senderId={settings.senderId} adminPhone={settings.adminPhone} />
          </Panel>
          <Panel title="Send a test" description="Check delivery and how your sender name looks.">
            <SmsTestForm defaultPhone={settings.adminPhone} />
          </Panel>
          <div className="rounded-2xl border border-dashed border-husk/15 p-5 text-xs leading-relaxed text-husk-soft">
            <p className="font-semibold text-husk">How it works</p>
            <p className="mt-1.5">
              Order-placed texts go out right after checkout. Status texts go out when you change an
              order’s status (including bulk confirm). Picking the same status again never re-sends.
              Emails continue independently.
            </p>
          </div>
        </aside>
      </div>

      {/* ── log ── */}
      <section id="log" className="mt-12 scroll-mt-24 rounded-2xl border border-husk/10 bg-rice-50 p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-husk">Message log</h2>
            <p className="mt-0.5 text-sm text-husk-soft">The latest 60 messages, newest first.</p>
          </div>
          <nav className="flex gap-1 rounded-full bg-husk/5 p-1" aria-label="Filter messages">
            {LOG_FILTERS.map((f) => (
              <Link
                key={f.key || "all"}
                href={f.key ? `/admin/sms?log=${f.key}#log` : "/admin/sms#log"}
                scroll={false}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  logFilter === f.key ? "bg-paddy-800 text-rice-50" : "text-husk-soft hover:text-husk",
                )}
              >
                {f.label}
              </Link>
            ))}
          </nav>
        </div>

        {logs.length === 0 ? (
          <div className="py-14 text-center">
            <p className="font-display text-lg text-husk">No messages {logFilter ? "here" : "yet"}</p>
            <p className="mt-1 text-sm text-husk-soft">
              {logFilter ? "Nothing matches this filter." : "Texts will appear here as orders move along — or send a test."}
            </p>
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-husk/8">
            {logs.map((l) => (
              <li key={l.id} className="grid gap-x-5 gap-y-2 py-4 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-start">
                <time
                  dateTime={l.createdAt.toISOString()}
                  className="text-xs tabular-nums text-husk-soft"
                >
                  {l.createdAt.toLocaleDateString("en-LK", { day: "numeric", month: "short", timeZone: TZ })}
                  <span className="text-husk-soft/60">
                    {" · "}
                    {l.createdAt.toLocaleTimeString("en-LK", { hour: "numeric", minute: "2-digit", timeZone: TZ })}
                  </span>
                </time>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span className="font-medium tabular-nums text-husk">{prettyPhone(l.to)}</span>
                    <span className="rounded-full bg-husk/5 px-2 py-0.5 text-[0.65rem] font-semibold text-husk-soft">
                      {EVENT_LABEL[l.event] ?? l.event}
                    </span>
                    {l.orderNo && (
                      <Link href={`/admin/orders?q=${encodeURIComponent(l.orderNo)}`} className="text-xs font-semibold text-paddy-700 hover:text-paddy-900">
                        {l.orderNo}
                      </Link>
                    )}
                    {l.segments > 1 && <span className="text-[0.7rem] text-harvest-700">{l.segments} credits</span>}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-husk-soft" title={l.message}>
                    {l.message}
                  </p>
                  {l.error && <p className="mt-1 text-xs font-medium text-clay-600">{l.error}</p>}
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <StatusChip status={l.status} />
                  {l.status !== "SENT" && <SmsRetryButton logId={l.id} />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
