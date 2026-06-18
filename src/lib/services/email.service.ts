import { Resend } from "resend";
import { formatLKR } from "@/lib/pricing";

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || "SamadhiRice <orders@samadhirice.lk>";
const resend = apiKey ? new Resend(apiKey) : null;

type OrderItemLite = { name: string; weightKg: number; quantity: number; unitPrice: number };
type OrderLite = {
  orderNo: string;
  email: string;
  customerName: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  status: string;
  items: OrderItemLite[];
};

async function send(to: string, subject: string, html: string) {
  if (!resend || !to) {
    console.log(
      `[email] skipped "${subject}" -> ${to || "no-recipient"} (RESEND_API_KEY ${apiKey ? "set" : "not set"})`,
    );
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (e) {
    console.error("[email] send failed:", e);
  }
}

function shell(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f7f1e4;font-family:Georgia,serif;color:#221f17">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <div style="font-size:22px;font-weight:600;letter-spacing:-.5px">Samadhi<span style="color:#c79a3b">Rice</span><span style="font-size:11px;color:#8a8674">.lk</span></div>
    <div style="background:#fbf8f0;border:1px solid #e3d4b6;border-radius:18px;padding:28px;margin-top:18px">
      <h1 style="font-size:22px;margin:0 0 12px">${title}</h1>
      ${body}
    </div>
    <p style="font-size:12px;color:#8a8674;margin-top:18px;text-align:center">From our paddy fields to your table · SamadhiRice.lk</p>
  </div></body></html>`;
}

function itemsTable(o: OrderLite) {
  const rows = o.items
    .map(
      (it) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #efe6d2">${it.name} <span style="color:#8a8674">(${it.weightKg}kg ×${it.quantity})</span></td><td style="padding:6px 0;border-bottom:1px solid #efe6d2;text-align:right">${formatLKR(it.unitPrice * it.quantity)}</td></tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;margin:14px 0">
    ${rows}
    <tr><td style="padding-top:10px;color:#8a8674">Delivery</td><td style="padding-top:10px;text-align:right">${o.deliveryFee === 0 ? "Free" : formatLKR(o.deliveryFee)}</td></tr>
    <tr><td style="padding-top:6px;font-weight:700;font-size:16px">Total</td><td style="padding-top:6px;text-align:right;font-weight:700;font-size:16px">${formatLKR(o.total)}</td></tr>
  </table>`;
}

export async function sendOrderConfirmation(o: OrderLite) {
  const html = shell(
    `Thank you, ${o.customerName.split(" ")[0]}!`,
    `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6">We've received order <b>${o.orderNo}</b> and the mill has been notified. You'll pay <b>${formatLKR(o.total)}</b> in cash on delivery.</p>${itemsTable(o)}<p style="font-family:Arial,sans-serif;font-size:13px;color:#8a8674">We'll be in touch shortly to confirm delivery.</p>`,
  );
  await send(o.email, `Your SamadhiRice order ${o.orderNo} is confirmed`, html);
}

const STATUS_COPY: Record<string, string> = {
  CONFIRMED: "Your order is confirmed and heading to the mill.",
  PROCESSING: "Your rice is being milled fresh and packed.",
  SHIPPED: "Your order is out for delivery — we'll call before we arrive.",
  DELIVERED: "Your order has been delivered. Enjoy! 🌾",
  CANCELLED: "Your order has been cancelled. Contact us if this is unexpected.",
};

export async function sendStatusUpdate(o: OrderLite) {
  const copy = STATUS_COPY[o.status];
  if (!copy) return; // no email for PENDING
  const html = shell(
    `Order ${o.orderNo}: ${o.status.charAt(0) + o.status.slice(1).toLowerCase()}`,
    `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6">${copy}</p>${itemsTable(o)}`,
  );
  await send(o.email, `Update on your order ${o.orderNo}`, html);
}
