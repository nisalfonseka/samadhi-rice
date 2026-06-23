import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Samadhi Rice <hello@samadhirice.lk>",
        to: email,
        subject: "Welcome to the Samadhi Rice family!",
        html: "<p>Thank you for subscribing to our newsletter. We'll keep you updated on our latest harvests, offers, and heritage rice varieties!</p>",
      });
    } else {
      // Simulate API call for local development without key
      console.log(`[Newsletter API] Would have sent welcome email to: ${email}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Newsletter API] Error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
