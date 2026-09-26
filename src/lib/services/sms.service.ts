import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";
import { getSettings } from "@/lib/services/settings.service";
import {
  SMS_EVENTS,
  SMS_EVENT_META,
  SMS_SENDER_DEFAULT,
  normalizeLkMobile,
  orderSmsVars,
  renderSmsTemplate,
  smsStats,
  type SmsEvent,
  type SmsOrderEvent,
} from "@/lib/sms";

/* text.lk OAuth (v3) API — https://text.lk/docs/sms-api-endpoints/ */
const API = "https://app.text.lk/api/v3";
const apiToken = process.env.TEXTLK_API_TOKEN;

export const smsGatewayConfigured = () => Boolean(apiToken);

/* ---- settings ---------------------------------------------------------- */

export type SmsSettings = {
  enabled: boolean;
  senderId: string;
  adminPhone: string;
  events: Record<SmsEvent, { enabled: boolean; template: string; isDefault: boolean }>;
};

export const smsKey = {
  enabled: "sms_enabled",
  senderId: "sms_sender_id",
  adminPhone: "sms_admin_phone",
  eventEnabled: (e: SmsEvent) => `sms_${e.toLowerCase()}_enabled`,
  eventTemplate: (e: SmsEvent) => `sms_${e.toLowerCase()}_template`,
};

/**
 * Read straight from the table (not the cached site settings) — this runs on
 * every notification and a stale toggle would mean texting after an admin
 * switched an event off.
 */
export async function getSmsSettings(): Promise<SmsSettings> {
  let m = new Map<string, string>();
  try {
    const rows = await prisma.siteSetting.findMany({ where: { key: { startsWith: "sms_" } } });
    m = new Map(rows.map((r) => [r.key, r.value]));
  } catch (err) {
    console.error("[sms] settings unavailable, using defaults", err);
  }
  const events = {} as SmsSettings["events"];
  for (const e of SMS_EVENTS) {
    const tpl = m.get(smsKey.eventTemplate(e));
    const on = m.get(smsKey.eventEnabled(e));
    events[e] = {
      enabled: on == null ? SMS_EVENT_META[e].defaultOn : on === "true",
      template: tpl?.trim() ? tpl : SMS_EVENT_META[e].template,
      isDefault: !tpl?.trim(),
    };
  }
  return {
    enabled: (m.get(smsKey.enabled) ?? "true") === "true",
    senderId: m.get(smsKey.senderId) || process.env.TEXTLK_SENDER_ID || SMS_SENDER_DEFAULT,
    adminPhone: m.get(smsKey.adminPhone) ?? "",
    events,
  };
}

/* ---- sending ------------------------------------------------------------ */

export type SmsResult =
  | { ok: true; uid: string | null }
  | { ok: false; skipped?: boolean; error: string };

type SendMeta = {
  event: string;
  orderNo?: string | null;
  senderId?: string;
  /** retrying an existing log row — update it instead of adding another */
  logId?: string;
};

async function log(
  data: { to: string; message: string; status: "SENT" | "FAILED" | "SKIPPED"; providerUid?: string | null; cost?: number | null; error?: string | null },
  meta: SendMeta,
) {
  const row = {
    providerUid: null,
    cost: null,
    error: null,
    ...data,
    event: meta.event,
    orderNo: meta.orderNo ?? null,
    segments: smsStats(data.message).segments,
  };
  try {
    if (meta.logId) {
      await prisma.smsLog.update({ where: { id: meta.logId }, data: { ...row, createdAt: new Date() } });
    } else {
      await prisma.smsLog.create({ data: row });
    }
  } catch (e) {
    // the log must never break the flow that triggered the SMS
    console.error("[sms] could not write log", e);
  }
}

/** Sends one SMS through text.lk and records the attempt in SmsLog. */
export async function sendSMS(to: string, message: string, meta: SendMeta): Promise<SmsResult> {
  const recipient = normalizeLkMobile(to);
  const text = message.trim();

  const skip = async (error: string): Promise<SmsResult> => {
    console.log(`[sms] skipped ${meta.event} -> ${to || "no-recipient"}: ${error}`);
    await log({ to: to || "—", message: text, status: "SKIPPED", error }, meta);
    return { ok: false, skipped: true, error };
  };

  if (!text) return skip("Empty message");
  if (!recipient) return skip("Not a valid Sri Lankan mobile number");
  if (!apiToken) return skip("TEXTLK_API_TOKEN is not set");

  const senderId = meta.senderId ?? (await getSmsSettings()).senderId;

  try {
    const res = await fetch(`${API}/sms/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ recipient, sender_id: senderId, type: "plain", message: text }),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    const body = (await res.json().catch(() => null)) as {
      status?: string | boolean;
      message?: string;
      data?: { uid?: string; cost?: string | number };
    } | null;

    // text.lk reports failures as HTTP 200 + { status: "error" }
    const ok = res.ok && (body?.status === "success" || body?.status === true);
    if (!ok) {
      const error = body?.message || `HTTP ${res.status}`;
      console.error(`[sms] text.lk rejected ${meta.event} -> ${recipient}: ${error}`);
      await log({ to: recipient, message: text, status: "FAILED", error }, meta);
      return { ok: false, error };
    }

    const uid = body?.data?.uid ?? null;
    const cost = body?.data?.cost != null ? Number(body.data.cost) : null;
    await log(
      { to: recipient, message: text, status: "SENT", providerUid: uid, cost: Number.isFinite(cost) ? cost : null },
      meta,
    );
    return { ok: true, uid };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Network error";
    console.error("[sms] send failed:", e);
    await log({ to: recipient, message: text, status: "FAILED", error }, meta);
    return { ok: false, error };
  }
}

/* ---- order notifications ------------------------------------------------ */

type OrderForSms = {
  orderNo: string;
  customerName: string;
  phone: string;
  total: number;
  city?: string | null;
};

const STATUS_EVENT: Partial<Record<string, SmsOrderEvent>> = {
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

async function varsFor(order: OrderForSms) {
  const shop = await getSettings();
  return orderSmsVars(order, { siteUrl: SITE_URL, shopPhone: shop.contactPhone });
}

/**
 * Texts the customer for an order event — only if SMS is on globally AND that
 * event's switch is on. Never throws.
 */
export async function notifyOrderSms(order: OrderForSms, event: SmsOrderEvent) {
  try {
    const s = await getSmsSettings();
    if (!s.enabled || !s.events[event].enabled) return;
    const message = renderSmsTemplate(s.events[event].template, await varsFor(order));
    await sendSMS(order.phone, message, { event, orderNo: order.orderNo, senderId: s.senderId });
  } catch (e) {
    console.error("[sms] notifyOrderSms failed", e);
  }
}

/** Maps an order status to its SMS event (PENDING has none). */
export async function notifyOrderStatusSms(order: OrderForSms & { status: string }) {
  const event = STATUS_EVENT[order.status];
  if (event) await notifyOrderSms(order, event);
}

/** Alerts the shop's own phone about a new order, if configured. */
export async function notifyAdminNewOrder(order: OrderForSms) {
  try {
    const s = await getSmsSettings();
    const alert = s.events.ADMIN_NEW_ORDER;
    if (!s.enabled || !alert.enabled || !s.adminPhone) return;
    const message = renderSmsTemplate(alert.template, await varsFor(order));
    await sendSMS(s.adminPhone, message, { event: "ADMIN_NEW_ORDER", orderNo: order.orderNo, senderId: s.senderId });
  } catch (e) {
    console.error("[sms] notifyAdminNewOrder failed", e);
  }
}

/* ---- account + reporting -------------------------------------------------- */

export type SmsAccount =
  | { connected: true; balance: number | null; expiresAt: string | null; expired: boolean; name: string | null }
  | { connected: false; error: string; /** timeout/network — likely fine on refresh */ transient?: boolean };

/** text.lk returns e.g. "10th Aug 26, 8:59 PM" — parse it so we can warn. */
function parseTextLkDate(s: string | undefined): Date | null {
  const m = s?.match(/(\d{1,2})\w*\s+([A-Za-z]{3})\w*\s+(\d{2,4}),?\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  const months = "janfebmaraprmayjunjulaugsepoctnovdec";
  const mon = months.indexOf(m[2].toLowerCase()) / 3;
  if (mon < 0) return null;
  let h = Number(m[4]) % 12;
  if (m[6].toUpperCase() === "PM") h += 12;
  const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  // text.lk account timezone is Asia/Colombo (UTC+5:30)
  return new Date(Date.UTC(y, mon, Number(m[1]), h, Number(m[5])) - 330 * 60_000);
}

export async function getSmsAccount(): Promise<SmsAccount> {
  if (!apiToken) return { connected: false, error: "TEXTLK_API_TOKEN is not set" };
  const get = (path: string) =>
    fetch(`${API}/${path}`, {
      headers: { Authorization: `Bearer ${apiToken}`, Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    }).then((r) => r.json());
  try {
    const [bal, me] = await Promise.all([get("balance"), get("me").catch(() => null)]);
    if (bal?.status !== "success") {
      return { connected: false, error: bal?.message || "text.lk rejected the API token" };
    }
    const balance = Number(String(bal.data?.remaining_balance ?? "").replace(/[^\d.]/g, ""));
    const expires = parseTextLkDate(bal.data?.expired_on);
    const name = [me?.data?.first_name, me?.data?.last_name].filter(Boolean).join(" ") || null;
    return {
      connected: true,
      balance: Number.isFinite(balance) ? balance : null,
      expiresAt: expires ? expires.toISOString() : (bal.data?.expired_on ?? null),
      expired: expires ? expires.getTime() < Date.now() : false,
      name,
    };
  } catch (e) {
    console.error("[sms] text.lk account lookup failed", e);
    return { connected: false, transient: true, error: "text.lk didn’t respond in time — refresh to try again" };
  }
}

export async function getSmsStats() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const since30 = new Date(now.getTime() - 30 * 86_400_000);

  const [today, month, failed30, sent30] = await Promise.all([
    prisma.smsLog.count({ where: { status: "SENT", createdAt: { gte: startOfDay } } }),
    prisma.smsLog.aggregate({
      where: { status: "SENT", createdAt: { gte: startOfMonth } },
      _count: true,
      _sum: { segments: true },
    }),
    prisma.smsLog.count({ where: { status: { in: ["FAILED", "SKIPPED"] }, createdAt: { gte: since30 } } }),
    prisma.smsLog.count({ where: { status: "SENT", createdAt: { gte: since30 } } }),
  ]);
  const attempts30 = failed30 + sent30;
  return {
    today,
    month: month._count,
    monthSegments: month._sum.segments ?? 0,
    failed30,
    deliveryRate: attempts30 ? Math.round((sent30 / attempts30) * 100) : null,
  };
}

export async function getSmsLogs(opts: { status?: string; take?: number; orderNo?: string } = {}) {
  return prisma.smsLog.findMany({
    where: {
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.orderNo ? { orderNo: opts.orderNo } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: opts.take ?? 60,
  });
}
