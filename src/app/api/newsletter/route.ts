import { NextResponse } from "next/server";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || "hello@samadhirice.lk";
const FROM_NAME = process.env.BREVO_FROM_NAME || "Samadhi Rice";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (BREVO_API_KEY) {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: FROM_NAME, email: FROM_EMAIL },
          to: [{ email }],
          subject: "Welcome to the Samadhi Rice family!",
          htmlContent:
            "<p>Thank you for subscribing to our newsletter. We'll keep you updated on our latest harvests, offers, and heritage rice varieties!</p>",
        }),
      });
      if (!res.ok) {
        console.error("[Newsletter API] Brevo send failed:", await res.text());
      }
    } else {
      // Simulate API call for local development without key
      console.log(`[Newsletter API] Would have sent welcome email to: ${email}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Newsletter API] Error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
