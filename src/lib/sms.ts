/* SMS primitives shared by the server (sending) and the admin UI (live
 * preview). Pure — no server imports, safe in client components. */

export const SMS_SENDER_DEFAULT = "SamadhiRice";

/** Customer-facing order events, in the order an order moves through them. */
export const SMS_ORDER_EVENTS = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type SmsOrderEvent = (typeof SMS_ORDER_EVENTS)[number];

/** Configurable events = customer events + the shop's own new-order alert. */
export type SmsEvent = SmsOrderEvent | "ADMIN_NEW_ORDER";
export const SMS_EVENTS: SmsEvent[] = [...SMS_ORDER_EVENTS, "ADMIN_NEW_ORDER"];

export const SMS_EVENT_META: Record<
  SmsEvent,
  { label: string; sinhala: string; when: string; defaultOn: boolean; template: string }
> = {
  PLACED: {
    label: "Order placed",
    sinhala: "ඇණවුම ලැබුණි",
    when: "Right after the customer checks out.",
    defaultOn: true,
    template:
      "Ayubowan {firstName}! SamadhiRice received your order {orderNo} ({total}). We will call to confirm. Track: {link}",
  },
  CONFIRMED: {
    label: "Confirmed",
    sinhala: "තහවුරු කළා",
    when: "When you mark the order Confirmed.",
    defaultOn: true,
    template:
      "Hi {firstName}, your order {orderNo} is confirmed and heading to the mill. Total {total}, cash on delivery. - SamadhiRice",
  },
  PROCESSING: {
    label: "Milling & packing",
    sinhala: "කොටමින් සිටී",
    when: "When the order moves to Processing.",
    defaultOn: false,
    template:
      "{firstName}, your rice for order {orderNo} is being milled fresh and packed today. - SamadhiRice",
  },
  SHIPPED: {
    label: "Out for delivery",
    sinhala: "බෙදාහැරීමට",
    when: "When the order is Shipped.",
    defaultOn: true,
    template:
      "Good news {firstName}! Order {orderNo} is out for delivery. Our rider will call before arriving. Please keep {total} ready. - SamadhiRice",
  },
  DELIVERED: {
    label: "Delivered",
    sinhala: "ලැබුණා",
    when: "When the order is marked Delivered.",
    defaultOn: true,
    template:
      "Order {orderNo} delivered. Thank you {firstName}! Enjoy your SamadhiRice and tell us how it was: {link}",
  },
  CANCELLED: {
    label: "Cancelled",
    sinhala: "අවලංගුයි",
    when: "When the order is Cancelled.",
    defaultOn: true,
    template:
      "Your SamadhiRice order {orderNo} has been cancelled. If this is unexpected, please call us on {shopPhone}.",
  },
  ADMIN_NEW_ORDER: {
    label: "New-order alert to shop",
    sinhala: "නව ඇණවුමක්",
    when: "Sent to the shop phone below for every new order.",
    defaultOn: false,
    template: "New order {orderNo}: {total} from {name}, {city}. Call {phone}",
  },
};

export const SMS_PLACEHOLDERS: { key: string; hint: string }[] = [
  { key: "firstName", hint: "Nimal" },
  { key: "name", hint: "Nimal Perera" },
  { key: "orderNo", hint: "SR-MD4K2Q7XA" },
  { key: "total", hint: "Rs.4,850" },
  { key: "city", hint: "Kandy" },
  { key: "phone", hint: "0771234567" },
  { key: "link", hint: "order tracking page" },
  { key: "shopPhone", hint: "your contact number" },
];

export type SmsVars = Record<string, string>;

export function orderSmsVars(
  o: { orderNo: string; customerName: string; total: number; city?: string | null; phone?: string | null },
  opts: { siteUrl: string; shopPhone?: string },
): SmsVars {
  const name = o.customerName.trim();
  return {
    name,
    firstName: name.split(/\s+/)[0] || name,
    orderNo: o.orderNo,
    // en-US grouping keeps the string inside the GSM-7 alphabet
    total: `Rs.${o.total.toLocaleString("en-US")}`,
    city: o.city ?? "",
    phone: o.phone ?? "",
    link: `${opts.siteUrl.replace(/\/$/, "")}/order/${o.orderNo}`,
    shopPhone: opts.shopPhone || "our hotline",
  };
}

/** Sample values for the admin preview. */
export const SMS_SAMPLE_VARS: SmsVars = orderSmsVars(
  { orderNo: "SR-MD4K2Q7XA", customerName: "Nimal Perera", total: 4850, city: "Kandy", phone: "0771234567" },
  { siteUrl: "https://www.samadhirice.lk", shopPhone: "0112 345 678" },
);

export function renderSmsTemplate(template: string, vars: SmsVars) {
  return template
    .replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? vars[k] : m))
    .replace(/[ \t]+/g, " ")
    .trim();
}

/**
 * Normalises a Sri Lankan mobile number to text.lk's 94XXXXXXXXX format.
 * Accepts 077…, 77…, +9477…, 009477…, with spaces/dashes. Returns null for
 * anything that isn't a mobile number (landlines can't receive SMS).
 */
export function normalizeLkMobile(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("0094")) d = d.slice(4);
  else if (d.startsWith("94") && d.length === 11) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);
  return /^7\d{8}$/.test(d) ? `94${d}` : null;
}

/* ---- segment counting ------------------------------------------------ */

const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM_EXT = "^{}\\[~]|€\f";
const GSM_BASIC_SET = new Set(GSM_BASIC);
const GSM_EXT_SET = new Set(GSM_EXT);

export type SmsStats = {
  encoding: "GSM-7" | "Unicode";
  /** length in encoding units (GSM septets or UTF-16 code units) */
  length: number;
  segments: number;
  /** units left before another segment is needed */
  remaining: number;
  /** characters that forced Unicode, for a helpful hint */
  offenders: string[];
};

export function smsStats(text: string): SmsStats {
  let septets = 0;
  const offenders = new Set<string>();
  for (const ch of text) {
    if (GSM_BASIC_SET.has(ch)) septets += 1;
    else if (GSM_EXT_SET.has(ch)) septets += 2;
    else offenders.add(ch);
  }

  if (offenders.size === 0) {
    const segments = septets <= 160 ? 1 : Math.ceil(septets / 153);
    const cap = segments === 1 ? 160 : segments * 153;
    return { encoding: "GSM-7", length: septets, segments, remaining: cap - septets, offenders: [] };
  }

  const units = text.length; // UTF-16 code units — emoji count as 2
  const segments = units <= 70 ? 1 : Math.ceil(units / 67);
  const cap = segments === 1 ? 70 : segments * 67;
  return {
    encoding: "Unicode",
    length: units,
    segments,
    remaining: cap - units,
    offenders: [...offenders].slice(0, 6),
  };
}

/** text.lk: alphanumeric ≤ 11 chars, or a phone number with country code. */
export function isValidSenderId(s: string) {
  return /^[A-Za-z0-9 ]{1,11}$/.test(s) || /^\+?\d{6,15}$/.test(s);
}
